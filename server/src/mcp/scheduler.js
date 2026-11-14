import { v4 as uuidv4 } from 'uuid';
import db from '../database/db.js';
import { config } from '../config/index.js';
import { callMcpTool, sanitize } from './client.js';
import sseManager from '../services/sse.js';

class McpScheduler {
  constructor() {
    this.intervalMs = config.rateLimitIntervalMs;
    this.isProcessing = false;
    this.loopTimer = null;
    this.responseHandlers = new Map(); // toolName -> callback
  }

  registerHandler(toolName, handler) {
    this.responseHandlers.set(toolName, handler);
  }

  async start() {
    console.log(`[Scheduler] Starting MCP Central Scheduler with ${this.intervalMs}ms interval...`);
    // Reset any hanging 'processing' jobs from a previous backend crash
    await db.query(
      `UPDATE mcp_queue SET status = 'queued' WHERE status = 'processing'`
    );
    await this.updateSyncCounts();

    if (this.loopTimer) clearInterval(this.loopTimer);
    this.loopTimer = setInterval(() => this.processNext(), 2000);
    this.processNext();
  }

  stop() {
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  async enqueue(toolName, args = {}, priority = 10, metadata = {}) {
    // Check for duplicate pending requests
    const existing = await db.query(
      `SELECT id FROM mcp_queue 
       WHERE tool_name = $1 
         AND arguments::text = $2::text 
         AND status IN ('queued', 'processing')
       LIMIT 1`,
      [toolName, JSON.stringify(args)]
    );

    if (existing.rows.length > 0) {
      return { id: existing.rows[0].id, alreadyQueued: true };
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO mcp_queue (id, tool_name, arguments, priority, status, created_at)
       VALUES ($1, $2, $3, $4, 'queued', NOW())`,
      [id, toolName, JSON.stringify(args), priority]
    );

    await this.updateSyncCounts();

    sseManager.broadcast('queue_updated', {
      action: 'enqueued',
      id,
      toolName,
      priority
    });

    // Attempt processing immediately if interval permits
    this.processNext();

    return { id, alreadyQueued: false };
  }

  async processNext() {
    if (this.isProcessing) return;

    try {
      // 1. Check sync_state
      const stateRes = await db.query(
        `SELECT * FROM sync_state WHERE id = 'global'`
      );
      const state = stateRes.rows[0] || {};
      const now = Date.now();
      const nextAllowed = state.next_allowed_request_at ? new Date(state.next_allowed_request_at).getTime() : 0;

      if (now < nextAllowed) {
        // Still in rate-limit cooldown
        return;
      }

      // 2. Fetch the highest priority queued item
      const itemRes = await db.query(
        `SELECT * FROM mcp_queue 
         WHERE status = 'queued' 
         ORDER BY priority ASC, created_at ASC 
         LIMIT 1`
      );

      if (itemRes.rows.length === 0) {
        return;
      }

      const item = itemRes.rows[0];
      this.isProcessing = true;

      // Mark as processing
      await db.query(
        `UPDATE mcp_queue SET status = 'processing' WHERE id = $1`,
        [item.id]
      );
      await db.query(
        `UPDATE sync_state 
         SET synchronization_status = 'syncing', 
             last_request_at = NOW() 
         WHERE id = 'global'`
      );

      sseManager.broadcast('operation_started', {
        id: item.id,
        toolName: item.tool_name,
        arguments: item.arguments
      });

      console.log(`[Scheduler] Executing MCP Tool: ${item.tool_name} (Queue ID: ${item.id})`);

      let result = null;
      let toolError = null;

      try {
        result = await callMcpTool(item.tool_name, item.arguments);
      } catch (err) {
        toolError = err;
      }

      const completedAt = new Date();
      const nextAllowedDate = new Date(completedAt.getTime() + this.intervalMs);

      if (toolError) {
        console.error(`[Scheduler] Tool execution error for ${item.tool_name}:`, toolError.message);
        
        await db.query(
          `UPDATE mcp_queue 
           SET status = 'failed', 
               error = $1, 
               completed_at = NOW() 
           WHERE id = $2`,
          [sanitize(toolError.message), item.id]
        );

        await db.query(
          `UPDATE sync_state 
           SET synchronization_status = 'error', 
               last_error = $1, 
               next_allowed_request_at = $2 
           WHERE id = 'global'`,
          [sanitize(toolError.message), nextAllowedDate]
        );

        sseManager.broadcast('operation_failed', {
          id: item.id,
          toolName: item.tool_name,
          error: sanitize(toolError.message),
          nextAllowedAt: nextAllowedDate.toISOString()
        });
      } else {
        console.log(`[Scheduler] MCP Tool ${item.tool_name} succeeded.`);

        // Persist raw response
        const accountId = item.arguments?.account || null;
        await db.query(
          `INSERT INTO raw_mcp_responses (tool_name, account_id, response_payload, retrieved_at)
           VALUES ($1, $2, $3, NOW())`,
          [item.tool_name, accountId, JSON.stringify(result)]
        );

        await db.query(
          `UPDATE mcp_queue 
           SET status = 'completed', 
               result = $1, 
               completed_at = NOW() 
           WHERE id = $2`,
          [JSON.stringify(result), item.id]
        );

        await db.query(
          `UPDATE sync_state 
           SET synchronization_status = 'idle', 
               last_successful_sync_at = NOW(), 
               next_allowed_request_at = $1, 
               last_error = NULL 
           WHERE id = 'global'`,
          [nextAllowedDate]
        );

        sseManager.broadcast('operation_completed', {
          id: item.id,
          toolName: item.tool_name,
          nextAllowedAt: nextAllowedDate.toISOString()
        });

        // Trigger response handler if registered
        const handler = this.responseHandlers.get(item.tool_name);
        if (handler) {
          try {
            await handler(result, item.arguments, item);
          } catch (handlerErr) {
            console.error(`[Scheduler] Handler error for ${item.tool_name}:`, handlerErr);
          }
        }
      }

      await this.updateSyncCounts();
    } catch (err) {
      console.error('[Scheduler] Unexpected scheduler error:', err);
    } finally {
      this.isProcessing = false;
    }
  }

  async updateSyncCounts() {
    try {
      const countsRes = await db.query(
        `SELECT 
           COUNT(*) FILTER (WHERE status = 'queued') AS pending,
           COUNT(*) FILTER (WHERE status = 'processing') AS processing,
           COUNT(*) FILTER (WHERE status = 'completed') AS completed,
           COUNT(*) FILTER (WHERE status = 'failed') AS failed
         FROM mcp_queue`
      );
      const pendingCount = parseInt(countsRes.rows[0].pending, 10);

      await db.query(
        `UPDATE sync_state 
         SET pending_operations_count = $1 
         WHERE id = 'global'`,
        [pendingCount]
      );
    } catch (err) {
      console.error('[Scheduler] Failed to update sync counts:', err.message);
    }
  }

  async getStatus() {
    const stateRes = await db.query(`SELECT * FROM sync_state WHERE id = 'global'`);
    const state = stateRes.rows[0] || {};
    
    const queueCountsRes = await db.query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'queued') AS pending,
         COUNT(*) FILTER (WHERE status = 'processing') AS processing,
         COUNT(*) FILTER (WHERE status = 'completed') AS completed,
         COUNT(*) FILTER (WHERE status = 'failed') AS failed
       FROM mcp_queue`
    );

    const now = Date.now();
    const nextAllowed = state.next_allowed_request_at ? new Date(state.next_allowed_request_at).getTime() : 0;
    const cooldownRemainingMs = Math.max(0, nextAllowed - now);

    return {
      syncState: state.synchronization_status || 'idle',
      lastRequestAt: state.last_request_at,
      lastSuccessfulSyncAt: state.last_successful_sync_at,
      nextAllowedRequestAt: state.next_allowed_request_at,
      cooldownRemainingSeconds: Math.ceil(cooldownRemainingMs / 1000),
      lastError: state.last_error,
      counts: queueCountsRes.rows[0],
      isProcessing: this.isProcessing
    };
  }

  async getRecentQueue(limit = 20) {
    const res = await db.query(
      `SELECT id, tool_name, arguments, priority, status, error, created_at, completed_at
       FROM mcp_queue 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  }
}

export const mcpScheduler = new McpScheduler();
export default mcpScheduler;
