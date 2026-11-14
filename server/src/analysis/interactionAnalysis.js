import db from '../database/db.js';

/**
 * Parses diverse date formats into standard YYYY-MM-DD and timestamp.
 */
function parseDateToTimestamp(dateStr) {
  if (!dateStr) return { dateStr: '2026-10-01', timestamp: new Date('2026-10-01').getTime() };
  
  // Try direct parse
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    return {
      dateStr: d.toISOString().split('T')[0],
      timestamp: d.getTime()
    };
  }

  // Handle DD Month YYYY (e.g. 24 March 2026 or 2 October 2026)
  const months = {
    january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
    jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const mStr = parts[1].toLowerCase();
    const month = months[mStr] || '01';
    const year = parts[2];
    const iso = `${year}-${month}-${day}`;
    const ts = new Date(iso).getTime();
    if (!isNaN(ts)) {
      return { dateStr: iso, timestamp: ts };
    }
  }

  return { dateStr: String(dateStr), timestamp: 0 };
}

/**
 * Synthesizes customer/account interactions from:
 * 1. Evidence (Emails, Calls, Paperwork records)
 * 2. Support Tickets (Paperwork JSON + Live Signals)
 * 3. Live Telemetry Signals (Flight stoppage, Resignation, Event Escalation)
 * 4. User Notes & MCP Write-Backs
 */
export async function getUnifiedTimeline({ accountId = null, channel = null, query = null, limit = 100 } = {}) {
  const accountsRes = await db.query('SELECT id, name FROM accounts');
  const accountMap = {};
  accountsRes.rows.forEach(a => { accountMap[a.id] = a.name; });

  const timeline = [];

  // 1. Evidence: Emails and Calls
  const evRes = await db.query(`SELECT * FROM evidence`);
  for (const ev of evRes.rows) {
    if (ev.source_type === 'email') {
      try {
        let text = ev.excerpt;
        let path = ev.source_id;
        try {
          const parsed = JSON.parse(ev.excerpt);
          text = parsed.text || ev.excerpt;
          path = parsed.path || ev.source_id;
        } catch (_) {}

        const lines = text.split('\n');
        let from = '', to = '', rawDate = '', subject = '';
        for (const line of lines) {
          const l = line.trim();
          if (l.toLowerCase().startsWith('from:')) from = l.slice(5).trim();
          if (l.toLowerCase().startsWith('to:')) to = l.slice(3).trim();
          if (l.toLowerCase().startsWith('date:')) rawDate = l.slice(5).trim();
          if (l.toLowerCase().startsWith('subject:')) subject = l.slice(8).trim();
        }

        const { dateStr, timestamp } = parseDateToTimestamp(rawDate || ev.source_date);
        
        let sentiment = 'neutral';
        let urgency = 'medium';
        const lower = text.toLowerCase();
        if (lower.includes('urgent') || lower.includes('fail') || lower.includes('will not last') || lower.includes('threat') || lower.includes('batteries')) {
          sentiment = 'negative';
          urgency = 'high';
        } else if (lower.includes('tender') || lower.includes('opportunity') || lower.includes('keen') || lower.includes('big coming')) {
          sentiment = 'positive';
          urgency = 'high';
        }

        const participants = [from, to].filter(Boolean);
        const bodyLines = lines.filter(l => {
          const lowerL = l.toLowerCase();
          return !lowerL.startsWith('from:') && !lowerL.startsWith('to:') && !lowerL.startsWith('date:') && !lowerL.startsWith('subject:');
        }).join(' ').trim();

        timeline.push({
          id: ev.id,
          accountId: ev.account_id,
          accountName: accountMap[ev.account_id] || ev.account_id,
          channel: 'email',
          channelLabel: 'Email Communication',
          date: dateStr,
          timestamp,
          title: subject || `Email: ${from || path}`,
          participants: participants.length > 0 ? participants : ['Customer Stakeholder', 'FlytBase Team'],
          summary: bodyLines.slice(0, 180) + (bodyLines.length > 180 ? '...' : ''),
          fullText: text,
          sentiment,
          urgency,
          status: 'delivered',
          evidenceId: ev.id,
          sourceId: path || ev.source_id,
          tags: ['Email', from ? from.split(' ')[0] : 'Communication']
        });
      } catch (err) {
        // Skip unparseable
      }
    } else if (ev.source_type === 'call') {
      const lines = ev.excerpt.split('\n');
      const titleLine = lines[0] || 'Call Notes';
      let rawDate = '';
      let customerPresent = '';
      let fbPresent = '';
      for (const line of lines) {
        const l = line.trim();
        if (l.toLowerCase().startsWith('date:')) rawDate = l.slice(5).trim();
        if (l.toLowerCase().includes('present for the customer:')) customerPresent = l.split(':')[1]?.trim();
        if (l.toLowerCase().includes('present for flytbase:')) fbPresent = l.split(':')[1]?.trim();
      }

      const { dateStr, timestamp } = parseDateToTimestamp(rawDate || ev.source_date);
      const participants = [customerPresent, fbPresent].filter(Boolean);

      timeline.push({
        id: ev.id,
        accountId: ev.account_id,
        accountName: accountMap[ev.account_id] || ev.account_id,
        channel: 'call',
        channelLabel: 'Call Transcript / Notes',
        date: dateStr,
        timestamp,
        title: titleLine.replace(': NOTES', '').replace(':', ' -'),
        participants: participants.length > 0 ? participants : ['Programme Lead', 'FlytBase Deal Team'],
        summary: lines.slice(3, 8).join(' ').trim().slice(0, 180) + '...',
        fullText: ev.excerpt,
        sentiment: 'neutral',
        urgency: 'medium',
        status: 'completed',
        evidenceId: ev.id,
        sourceId: ev.source_id,
        tags: ['Call Notes', customerPresent ? customerPresent.split(' ')[0] : 'Operations']
      });
    } else if (ev.source_type === 'contract' || ev.source_type === 'commercial_offer') {
      const { dateStr, timestamp } = parseDateToTimestamp(ev.source_date || '2026-02-01');
      timeline.push({
        id: ev.id,
        accountId: ev.account_id,
        accountName: accountMap[ev.account_id] || ev.account_id,
        channel: 'contract',
        channelLabel: 'Commercial Contract / Proposal',
        date: dateStr,
        timestamp,
        title: `Agreement Document: ${ev.source_id}`,
        participants: ['Authorized Signatory', 'FlytBase Commercials'],
        summary: ev.excerpt.slice(0, 180) + '...',
        fullText: ev.excerpt,
        sentiment: 'positive',
        urgency: 'low',
        status: 'executed',
        evidenceId: ev.id,
        sourceId: ev.source_id,
        tags: ['Contract', 'Commercial Agreement']
      });
    }
  }

  // 2. Paperwork Tickets from mcp_queue
  try {
    const pwRes = await db.query(`SELECT result FROM mcp_queue WHERE tool_name = 'get_all_paperwork' AND status = 'completed'`);
    for (const row of pwRes.rows) {
      const accId = row.result?.account;
      const records = row.result?.records || [];
      for (const rec of records) {
        if (rec.kind === 'tickets' && rec.data?.tickets) {
          for (const t of rec.data.tickets) {
            const { dateStr, timestamp } = parseDateToTimestamp(t.opened);
            const firstMsg = t.conversation && t.conversation[0]?.text;
            const isClosed = t.status === 'Closed';
            
            timeline.push({
              id: `ticket_${t.id}`,
              accountId: accId,
              accountName: accountMap[accId] || accId,
              channel: 'ticket',
              channelLabel: 'Support Ticket',
              date: dateStr,
              timestamp,
              title: `${t.id}: ${t.subject}`,
              participants: [t.requester, t.assignee].filter(Boolean),
              summary: firstMsg || t.subject,
              fullText: JSON.stringify(t, null, 2),
              sentiment: isClosed ? 'neutral' : 'negative',
              urgency: isClosed ? 'low' : 'high',
              status: isClosed ? 'closed' : 'open',
              evidenceId: `ev_pw_${accId}_tickets_json`,
              sourceId: t.id,
              tags: ['Ticket', t.category || 'Support', t.status]
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('[Timeline] Error extracting paperwork tickets:', err.message);
  }

  // 3. Live Telemetry Signals (Rhys Calder departure, FB-11206 escalation, Aldermoor silent docks)
  try {
    const sigRes = await db.query(`SELECT * FROM signals`);
    for (const sig of sigRes.rows) {
      const p = sig.payload || {};
      let channel = 'telemetry';
      let channelLabel = 'Live Telemetry Signal';
      let urgency = 'critical';
      let sentiment = 'critical';
      let participants = ['Operations & Risk Lead'];

      if (sig.external_id === 'urgent_request') {
        channel = 'ticket';
        channelLabel = 'Escalated Support Ticket';
        participants = ['Insp. Karen Mbeki', 'CSM (FlytBase)'];
      } else if (sig.external_id === 'champion_leaves') {
        channel = 'email';
        channelLabel = 'Executive Leadership Notice';
        participants = ['Rhys Calder', 'CSM (FlytBase)'];
      } else if (sig.external_id === 'aldermoor_usage_freeze') {
        channel = 'telemetry';
        channelLabel = 'Telemetry Anomaly Alert';
        participants = ['Automated Fleet Telemetry', 'Plant Operations'];
      }

      const { dateStr, timestamp } = parseDateToTimestamp(p.dated || '2026-11-18');

      timeline.push({
        id: `sig_${sig.id}`,
        accountId: sig.account_id,
        accountName: accountMap[sig.account_id] || sig.account_id,
        channel,
        channelLabel,
        date: dateStr,
        timestamp,
        title: p.title || 'Live Signal Alert',
        participants,
        summary: p.summary || 'Operational signal flagged by monitoring pipeline.',
        fullText: JSON.stringify(p, null, 2),
        sentiment,
        urgency,
        status: 'escalated',
        evidenceId: 'ev_sig_' + sig.external_id,
        sourceId: sig.external_id,
        tags: ['Live Signal', 'Urgent Action Required', channelLabel]
      });
    }
  } catch (err) {
    console.error('[Timeline] Error extracting signals:', err.message);
  }

  // 4. Notes & Write-Backs
  try {
    const notesRes = await db.query(`SELECT * FROM notes ORDER BY created_at DESC`);
    for (const n of notesRes.rows) {
      const { dateStr, timestamp } = parseDateToTimestamp(n.created_at);
      timeline.push({
        id: `note_${n.id}`,
        accountId: n.account_id || 'A',
        accountName: accountMap[n.account_id] || 'All Accounts',
        channel: 'note',
        channelLabel: 'Account Note / MCP Write-Back',
        date: dateStr,
        timestamp,
        title: n.title || 'Account Note',
        participants: ['FlytBase Account Team'],
        summary: n.text.slice(0, 180) + (n.text.length > 180 ? '...' : ''),
        fullText: n.text,
        sentiment: 'neutral',
        urgency: 'medium',
        status: n.synchronization_status || 'synced',
        evidenceId: null,
        sourceId: `note-${n.id.slice(0, 8)}`,
        tags: ['Note', n.kind || 'general']
      });
    }
  } catch (err) {
    console.error('[Timeline] Error extracting notes:', err.message);
  }

  // Filter by accountId if specified
  let filtered = timeline;
  if (accountId && accountId !== 'all') {
    filtered = filtered.filter(item => item.accountId === accountId);
  }

  // Filter by channel if specified
  if (channel && channel !== 'all') {
    filtered = filtered.filter(item => item.channel === channel);
  }

  // Search query filter
  if (query && query.trim() !== '') {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(item => 
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.summary && item.summary.toLowerCase().includes(q)) ||
      (item.participants && item.participants.some(p => p.toLowerCase().includes(q))) ||
      (item.sourceId && item.sourceId.toLowerCase().includes(q))
    );
  }

  // Sort chronologically descending (newest first)
  filtered.sort((a, b) => b.timestamp - a.timestamp);

  // Return limited count
  return filtered.slice(0, limit);
}

export default { getUnifiedTimeline };
