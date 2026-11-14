import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db.js';
import mcpScheduler from '../mcp/scheduler.js';
import syncWorker from '../sync/worker.js';
import { getGlobalDashboard, getAccountIntelligence } from '../analysis/index.js';
import { analyzeDeals } from '../analysis/dealAnalysis.js';
import { analyzeStakeholders } from '../analysis/stakeholderAnalysis.js';
import { rankActions } from '../analysis/actionRanking.js';
import { analyzeRisks } from '../analysis/riskAnalysis.js';
import { analyzeGaps } from '../analysis/gapAnalysis.js';
import { analyzeSentiment } from '../analysis/sentimentAnalysis.js';
import { getAccountSummary } from '../analysis/summaryAnalysis.js';
import sseManager from '../services/sse.js';

const router = express.Router();

// 1. Health
router.get('/health', async (req, res) => {
  try {
    const dbRes = await db.query('SELECT NOW()');
    const syncStatus = await mcpScheduler.getStatus();
    res.json({
      status: 'healthy',
      timestamp: dbRes.rows[0].now,
      sync: syncStatus
    });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// 2. Global Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const data = await getGlobalDashboard();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Accounts
router.get('/accounts', async (req, res) => {
  try {
    const accountsRes = await db.query(`SELECT * FROM accounts ORDER BY name ASC`);
    const summaries = await Promise.all(
      accountsRes.rows.map(acc => getAccountSummary(acc.id))
    );
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/accounts/:accountId', async (req, res) => {
  try {
    const intel = await getAccountIntelligence(req.params.accountId);
    if (!intel) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(intel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/accounts/:accountId/summary', async (req, res) => {
  try {
    const summary = await getAccountSummary(req.params.accountId);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/accounts/:accountId/sentiment', async (req, res) => {
  try {
    const sentiment = await analyzeSentiment(req.params.accountId);
    res.json(sentiment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/accounts/:accountId/deals', async (req, res) => {
  try {
    const data = await analyzeDeals(req.params.accountId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/accounts/:accountId/stakeholders', async (req, res) => {
  try {
    const data = await analyzeStakeholders(req.params.accountId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/accounts/:accountId/actions', async (req, res) => {
  try {
    const data = await rankActions(req.params.accountId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/accounts/:accountId/risks', async (req, res) => {
  try {
    const data = await analyzeRisks(req.params.accountId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/accounts/:accountId/gaps', async (req, res) => {
  try {
    const data = await analyzeGaps(req.params.accountId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tasks / Priority Moves
router.get('/tasks', async (req, res) => {
  try {
    const tasksRes = await db.query(
      `SELECT a.*, d.title as deal_title, acc.name as account_name
       FROM actions a
       LEFT JOIN deals d ON d.id = a.deal_id
       LEFT JOIN accounts acc ON acc.id = a.account_id
       ORDER BY a.priority ASC, a.created_at ASC`
    );
    res.json(tasksRes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/tasks/:taskId', async (req, res) => {
  const { status } = req.body;
  try {
    const updateRes = await db.query(
      `UPDATE actions 
       SET status = COALESCE($1, status),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, req.params.taskId]
    );
    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    sseManager.broadcast('task_updated', updateRes.rows[0]);
    res.json(updateRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Deals
router.get('/deals', async (req, res) => {
  try {
    const dealsRes = await db.query(
      `SELECT d.*, a.name as account_name,
         COALESCE(
           jsonb_agg(
             DISTINCT jsonb_build_object(
               'id', e.id,
               'source_type', e.source_type,
               'source_id', e.source_id,
               'excerpt', e.excerpt,
               'confidence', e.confidence
             )
           ) FILTER (WHERE e.id IS NOT NULL), '[]'::jsonb
         ) AS evidence
       FROM deals d
       JOIN accounts a ON a.id = d.account_id
       LEFT JOIN evidence e ON e.deal_id = d.id
       GROUP BY d.id, a.name
       ORDER BY d.amount DESC`
    );
    res.json(dealsRes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals/:dealId', async (req, res) => {
  try {
    const dealRes = await db.query(
      `SELECT d.*, a.name as account_name,
         COALESCE(
           jsonb_agg(
             DISTINCT jsonb_build_object(
               'id', e.id,
               'source_type', e.source_type,
               'source_id', e.source_id,
               'excerpt', e.excerpt,
               'confidence', e.confidence,
               'source_date', e.source_date
             )
           ) FILTER (WHERE e.id IS NOT NULL), '[]'::jsonb
         ) AS evidence
       FROM deals d
       JOIN accounts a ON a.id = d.account_id
       LEFT JOIN evidence e ON e.deal_id = d.id
       WHERE d.id = $1
       GROUP BY d.id, a.name`,
      [req.params.dealId]
    );
    if (dealRes.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json(dealRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Evidence
router.get('/evidence', async (req, res) => {
  try {
    const { accountId, dealId, query: q } = req.query;
    let sql = `SELECT e.*, a.name as account_name FROM evidence e LEFT JOIN accounts a ON a.id = e.account_id WHERE 1=1`;
    const params = [];

    if (accountId) {
      params.push(accountId);
      sql += ` AND e.account_id = $${params.length}`;
    }
    if (dealId) {
      params.push(dealId);
      sql += ` AND e.deal_id = $${params.length}`;
    }
    if (q) {
      params.push(`%${q}%`);
      sql += ` AND (e.excerpt ILIKE $${params.length} OR e.source_id ILIKE $${params.length})`;
    }

    sql += ` ORDER BY e.retrieved_at DESC LIMIT 100`;

    const evRes = await db.query(sql, params);
    res.json(evRes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/evidence/:evidenceId', async (req, res) => {
  try {
    const evRes = await db.query(
      `SELECT e.*, a.name as account_name, d.title as deal_title 
       FROM evidence e 
       LEFT JOIN accounts a ON a.id = e.account_id 
       LEFT JOIN deals d ON d.id = e.deal_id 
       WHERE e.id = $1`,
      [req.params.evidenceId]
    );
    if (evRes.rows.length === 0) {
      return res.status(404).json({ error: 'Evidence record not found' });
    }
    res.json(evRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Activity & Signals
router.get('/activity', async (req, res) => {
  try {
    const actRes = await db.query(
      `SELECT * FROM activities ORDER BY timestamp DESC LIMIT 50`
    );
    res.json(actRes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/signals', async (req, res) => {
  try {
    const sigRes = await db.query(
      `SELECT * FROM signals ORDER BY detected_at DESC LIMIT 50`
    );
    res.json(sigRes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Notes (Write-back to MCP)
router.get('/notes', async (req, res) => {
  try {
    const notesRes = await db.query(
      `SELECT * FROM notes ORDER BY created_at DESC`
    );
    res.json(notesRes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/notes', async (req, res) => {
  const { text, account, kind = 'note', title = 'Note' } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Note text is required' });
  }

  const localId = uuidv4();

  try {
    await db.query(
      `INSERT INTO notes (id, account_id, title, kind, text, synchronization_status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())`,
      [localId, account || null, title, kind, text]
    );

    const queueRes = await mcpScheduler.enqueue(
      'write_note',
      {
        text,
        account: account || undefined,
        kind,
        title
      },
      2
    );

    await db.query(
      `INSERT INTO activities (id, account_id, type, title, description, timestamp)
       VALUES ($1, $2, 'note', $3, $4, NOW())`,
      [uuidv4(), account || null, `Note Queued: ${title}`, text.slice(0, 100)]
    );

    sseManager.broadcast('note_created', {
      id: localId,
      queueId: queueRes.id,
      title,
      status: 'pending'
    });

    res.status(202).json({
      message: 'Note created and enqueued for MCP write-back',
      id: localId,
      queueId: queueRes.id,
      status: 'pending'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Sync Control & Status
router.get('/sync/status', async (req, res) => {
  try {
    const status = await mcpScheduler.getStatus();
    const queue = await mcpScheduler.getRecentQueue(15);
    res.json({
      ...status,
      recentQueue: queue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sync/initial', async (req, res) => {
  try {
    await syncWorker.queueInitialPipeline();
    res.json({ message: 'Initial ingestion pipeline queued successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sync/check', async (req, res) => {
  try {
    const queueRes = await mcpScheduler.enqueue('get_signals', {}, 3);
    res.json({ message: 'Live signal check enqueued', queueId: queueRes.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Real-time Events (SSE)
router.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');
  sseManager.addClient(res);
});

// 10. Hand In Links
router.get('/hand-in', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM hand_in_links WHERE id = 'current'`);
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/hand-in', async (req, res) => {
  const { hosted_url, github_repo_url, thinking_doc_url, walkthrough_video_url } = req.body;
  try {
    await db.query(
      `INSERT INTO hand_in_links (id, hosted_url, github_repo_url, thinking_doc_url, walkthrough_video_url, updated_at)
       VALUES ('current', $1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE
       SET hosted_url = EXCLUDED.hosted_url,
           github_repo_url = EXCLUDED.github_repo_url,
           thinking_doc_url = EXCLUDED.thinking_doc_url,
           walkthrough_video_url = EXCLUDED.walkthrough_video_url,
           updated_at = NOW()`,
      [hosted_url || '', github_repo_url || '', thinking_doc_url || '', walkthrough_video_url || '']
    );
    res.json({ message: 'Hand-in links updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
