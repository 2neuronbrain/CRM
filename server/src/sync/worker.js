import db from '../database/db.js';
import mcpScheduler from '../mcp/scheduler.js';
import { ingestAccounts, ingestPaperwork } from './ingestion.js';
import { processSignals } from './signalProcessor.js';

class BackgroundSyncWorker {
  constructor() {
    this.pollInterval = null;
  }

  async init() {
    console.log('[Worker] Initializing Background Sync Worker...');

    // 1. Register tool handlers with MCP Scheduler
    mcpScheduler.registerHandler('get_my_accounts', async (result) => {
      console.log('[Worker] Handling get_my_accounts response...');
      await ingestAccounts(result);
    });

    mcpScheduler.registerHandler('get_all_paperwork', async (result, args) => {
      const accountId = args?.account || 'A';
      console.log(`[Worker] Handling get_all_paperwork for Account ${accountId}...`);
      await ingestPaperwork(result, accountId);
    });

    mcpScheduler.registerHandler('get_signals', async (result) => {
      console.log('[Worker] Handling get_signals response...');
      const signals = Array.isArray(result) ? result : (result?.signals || []);
      await processSignals(signals);
    });

    mcpScheduler.registerHandler('write_note', async (result, args) => {
      console.log('[Worker] Handling write_note response from MCP...');
      const noteId = result?.id || result?.note_id || (typeof result === 'string' ? result : null);
      await db.query(
        `UPDATE notes 
         SET synchronization_status = 'synced', 
             external_id = COALESCE($1, external_id)
         WHERE synchronization_status = 'pending' 
           AND (text = $2 OR title = $3)`,
        [noteId, args?.text, args?.title]
      );
    });

    mcpScheduler.registerHandler('list_notes', async (result) => {
      console.log('[Worker] Handling list_notes response...');
      const notes = Array.isArray(result) ? result : (result?.notes || []);
      for (const note of notes) {
        await db.query(
          `INSERT INTO notes (id, external_id, account_id, title, kind, text, synchronization_status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'synced', NOW())
           ON CONFLICT (id) DO UPDATE
           SET text = EXCLUDED.text,
               synchronization_status = 'synced'`,
          [
            note.id || `mcp_note_${Date.now()}`,
            note.id,
            note.account,
            note.title || 'Note',
            note.kind || 'note',
            note.text
          ]
        );
      }
    });

    // 2. Start MCP Central Scheduler
    await mcpScheduler.start();

    // 3. Check if initial ingestion is needed
    await this.triggerInitialSyncIfNeeded();

    // 4. Start single polling interval for live signals
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => this.pollLiveSignals(), 65000);
  }

  async triggerInitialSyncIfNeeded() {
    const rawRes = await db.query(`SELECT COUNT(*) FROM raw_mcp_responses`);
    const count = parseInt(rawRes.rows[0].count, 10);

    if (count === 0) {
      console.log('[Worker] Zero raw responses in DB. Queuing initial ingestion pipeline...');
      await this.queueInitialPipeline();
    } else {
      console.log(`[Worker] Found ${count} cached responses. Pipeline already initialized.`);
    }
  }

  async queueInitialPipeline() {
    // Sequence according to specification:
    // 1. whoami (prio 1)
    // 2. get_data_format (prio 2)
    // 3. get_my_accounts (prio 3)
    // 4. get_all_paperwork Account A (prio 4)
    // 5. get_all_paperwork Account B (prio 5)
    // 6. get_feature_requests (prio 6)
    // 7. get_release_notes (prio 7)
    // 8. get_flytbase_team (prio 8)
    // 9. get_signals (prio 9)
    // 10. list_notes (prio 10)
    await mcpScheduler.enqueue('whoami', {}, 1);
    await mcpScheduler.enqueue('get_data_format', {}, 2);
    await mcpScheduler.enqueue('get_my_accounts', {}, 3);
    await mcpScheduler.enqueue('get_all_paperwork', { account: 'A' }, 4);
    await mcpScheduler.enqueue('get_all_paperwork', { account: 'B' }, 5);
    await mcpScheduler.enqueue('get_feature_requests', {}, 6);
    await mcpScheduler.enqueue('get_release_notes', {}, 7);
    await mcpScheduler.enqueue('get_flytbase_team', {}, 8);
    await mcpScheduler.enqueue('get_signals', {}, 9);
    await mcpScheduler.enqueue('list_notes', {}, 10);
  }

  async pollLiveSignals() {
    // Only queue get_signals if no other get_signals is queued or processing
    const pendingSignals = await db.query(
      `SELECT id FROM mcp_queue 
       WHERE tool_name = 'get_signals' 
         AND status IN ('queued', 'processing')
       LIMIT 1`
    );

    if (pendingSignals.rows.length === 0) {
      console.log('[Worker] Enqueuing periodic live signal check...');
      await mcpScheduler.enqueue('get_signals', {}, 20); // Priority 20 (lower than user writes or manual checks)
    }
  }

  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    mcpScheduler.stop();
  }
}

export const syncWorker = new BackgroundSyncWorker();
export default syncWorker;
