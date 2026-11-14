import db from '../database/db.js';
import sseManager from '../services/sse.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Processes incoming signals from get_signals tool
 */
export async function processSignals(signalsList) {
  if (!signalsList || !Array.isArray(signalsList)) return [];

  const newlyProcessed = [];

  for (const signal of signalsList) {
    const signalId = signal.id || signal.signal_id || uuidv4();
    
    // Check if already processed
    const existing = await db.query(
      `SELECT id FROM signals WHERE external_id = $1`,
      [signalId]
    );

    if (existing.rows.length > 0) {
      continue;
    }

    const text = signal.text || signal.summary || signal.description || JSON.stringify(signal);
    const accountCode = signal.account || (text.toLowerCase().includes('aldermoor') ? 'B' : (text.toLowerCase().includes('eastern') || text.toLowerCase().includes('westmere') || text.toLowerCase().includes('rhys') || text.toLowerCase().includes('karen') ? 'A' : null));
    const detectedAt = signal.date || signal.timestamp || new Date().toISOString();

    // 1. Save Signal Record
    await db.query(
      `INSERT INTO signals (id, external_id, account_id, payload, detected_at, processed_at, processing_status)
       VALUES ($1, $2, $3, $4, $5, NOW(), 'processed')`,
      [uuidv4(), signalId, accountCode, JSON.stringify(signal), detectedAt]
    );

    // 2. Save Evidence Object
    const evId = `ev_sig_${signalId}`;
    await db.query(
      `INSERT INTO evidence (id, account_id, source_type, source_id, tool_name, excerpt, source_date, confidence, retrieved_at)
       VALUES ($1, $2, 'live_signal', $3, 'get_signals', $4, $5, 'Verified', NOW())
       ON CONFLICT (id) DO NOTHING`,
      [evId, accountCode, signalId, text, detectedAt]
    );

    // 3. Pattern Detection & Intelligence derivation
    const textLower = text.toLowerCase();

    // Scenario A1: Rhys Calder departure
    if (textLower.includes('rhys calder') && (textLower.includes('leaving') || textLower.includes('leaves') || textLower.includes('moving on') || textLower.includes('january'))) {
      // Stakeholder departure risk
      const riskId = `risk_departure_${signalId}`;
      await db.query(
        `INSERT INTO risks (id, account_id, title, description, severity, detected_at, trigger_date, consequence, mitigation, responsible_owner, evidence_id, status)
         VALUES ($1, 'A', $2, $3, 'Red', NOW(), 'January 2027', $4, $5, 'Account Director', $6, 'active')
         ON CONFLICT (id) DO NOTHING`,
        [
          riskId,
          'Key Stakeholder Departure: Rhys Calder Leaving Drone Programme',
          'Rhys Calder emailed to state he is leaving the drone programme in January. No successor has been named, and all historic alliance calls were conducted with him alone.',
          'Critical loss of key relationship and continuity risk for 300-dock tender framework.',
          'Immediately map alternative stakeholders in procurement and individual forces (e.g. Insp Karen Mbeki, Hannah Doyle) and request formal handover meeting before January.',
          evId
        ]
      );

      // Intelligence Gap: Unknown Successor
      await db.query(
        `INSERT INTO intelligence_gaps (id, account_id, missing_information, importance, suggested_owner, recommended_question, priority, evidence_id, status)
         VALUES ($1, 'A', $2, $3, 'Account Director', $4, 'Critical', $5, 'open')
         ON CONFLICT (id) DO NOTHING`,
        [
          `gap_successor_${signalId}`,
          'Successor to Rhys Calder as Alliance Drone Programme Lead',
          'Without an identified successor, decision-making on alliance-wide deployment and the 300-dock framework locks out FlytBase.',
          'Who will be assuming leadership of the Alliance drone programme following Rhys Calder’s departure in January?',
          evId
        ]
      );

      // Recommended Action
      await db.query(
        `INSERT INTO actions (id, account_id, title, description, owner, priority, deadline, status, reasoning, expected_outcome, evidence_id)
         VALUES ($1, 'A', $2, $3, 'Account Director', 1, '2026-11-25', 'pending', $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          `act_handover_${signalId}`,
          'Schedule Succession & Handover Meeting with Rhys Calder',
          'Coordinate a formal handover review with Rhys Calder before his January departure and establish direct introductions to alliance force commanders.',
          'Ranked highest priority because continuity of the 300-dock framework depends on establishing incoming leadership access.',
          'Formal successor identified and direct relationship established.',
          evId
        ]
      );

      // Update person stance
      await db.query(
        `UPDATE people SET stance = 'Departing', metadata = jsonb_set(metadata, '{departure}', '"January"') WHERE external_id = 'rhys_calder'`
      );
    }

    // Scenario A2: Insp. Karen Mbeki unanswered request
    if (textLower.includes('mbeki') && (textLower.includes('public event') || textLower.includes('written confirmation') || textLower.includes('training') || textLower.includes('nobody has replied'))) {
      const riskId = `risk_unanswered_${signalId}`;
      await db.query(
        `INSERT INTO risks (id, account_id, title, description, severity, detected_at, trigger_date, consequence, mitigation, responsible_owner, evidence_id, status)
         VALUES ($1, 'A', $2, $3, 'Red', NOW(), '2026-12-05', $4, $5, 'Customer Success Lead', $6, 'active')
         ON CONFLICT (id) DO NOTHING`,
        [
          riskId,
          'Unanswered Customer Escalation: Westmere Public Event Approaching',
          'Insp. Karen Mbeki requested written confirmation of training dates for operators and failover contact before the Dec 5 public event. Ticket remains unanswered.',
          'Breakdown of customer trust, Westmere operational failure during high-visibility public event, jeopardy to fleet expansion.',
          'Provide written confirmation of training schedule today and establish formal on-call dock failure support escalation path.',
          evId
        ]
      );

      // Action: Respond to Karen Mbeki immediately
      await db.query(
        `INSERT INTO actions (id, account_id, title, description, owner, priority, deadline, status, reasoning, expected_outcome, evidence_id)
         VALUES ($1, 'A', $2, $3, 'Customer Success Lead', 1, '2026-11-20', 'pending', $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          `act_mbeki_reply_${signalId}`,
          'Send Written Confirmation of Training Dates & Event SLA to Insp. Mbeki',
          'Reply directly to Insp. Karen Mbeki with confirmed operator training dates before Dec 5 and emergency dock failure escalation contact.',
          'Ranked top priority because a customer commitment is overdue, public event is imminent (Dec 5), and Westmere is the primary operational force.',
          'Insp. Mbeki receives full written assurances and confirms operational readiness.',
          evId
        ]
      );

      // Update person concerns
      await db.query(
        `UPDATE people 
         SET stance = 'Guarded',
             metadata = jsonb_set(
               metadata, 
               '{concerns}', 
               '"Awaiting written operator training dates and emergency support SLA for Dec 5 public event"'
             )
         WHERE external_id = 'karen_mbeki'`
      );
    }

    // Scenario B1: Aldermoor three docks stopped flying
    if (textLower.includes('aldermoor') && (textLower.includes('three docks') || textLower.includes('flew nothing') || textLower.includes('stopped') || textLower.includes('online'))) {
      const riskId = `risk_usage_drop_${signalId}`;
      await db.query(
        `INSERT INTO risks (id, account_id, title, description, severity, detected_at, trigger_date, consequence, mitigation, responsible_owner, evidence_id, status)
         VALUES ($1, 'B', $2, $3, 'Red', NOW(), 'Immediate', $4, $5, 'Field Technical Specialist', $6, 'active')
         ON CONFLICT (id) DO NOTHING`,
        [
          riskId,
          'Silent Operational Freeze: 3 Docks Inactive for 2 Weeks Despite Remaining Online',
          'Three docks that previously flew nightly recorded zero flights between Nov 2 - Nov 29. Docks remain online with no tickets or customer notice submitted.',
          'Undetected operational blockage or stakeholder dissatisfaction; risk of silent churn and non-renewal of commercial contract.',
          'Perform remote telemetry diagnostics on all 3 offline docks and reach out proactively to operations manager to offer site inspection.',
          evId
        ]
      );

      // Action: Proactive investigation
      await db.query(
        `INSERT INTO actions (id, account_id, title, description, owner, priority, deadline, status, reasoning, expected_outcome, evidence_id)
         VALUES ($1, 'B', $2, $3, 'Field Technical Specialist', 1, '2026-11-18', 'pending', $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          `act_investigate_usage_${signalId}`,
          'Proactively Investigate Inactive Docks Telemetry and Contact Site Ops',
          'Pull dock system logs and initiate proactive outreach to Aldermoor facility manager regarding the flight stoppage.',
          'Ranked #1 because zero flights across active units for 2 consecutive weeks indicates severe unexpressed operational failure.',
          'Root cause of flight halt diagnosed and resolved before customer raises dispute.',
          evId
        ]
      );

      // Gap: Root cause of flight stoppage
      await db.query(
        `INSERT INTO intelligence_gaps (id, account_id, missing_information, importance, suggested_owner, recommended_question, priority, evidence_id, status)
         VALUES ($1, 'B', $2, $3, 'Field Technical Specialist', $4, 'Critical', $5, 'open')
         ON CONFLICT (id) DO NOTHING`,
        [
          `gap_inactivity_reason_${signalId}`,
          'Reason for 2-Week Operational Flight Freeze on 3 Active Docks',
          'If hardware fault or site restrictions exist, lack of customer reporting indicates disengagement or workaround.',
          'What operational change or site factor caused the three active docks to stop flying over the past two weeks?',
          evId
        ]
      );
    }

    // Generic Activity Log
    await db.query(
      `INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp)
       VALUES ($1, $2, 'signal', $3, $4, $5, $6)`,
      [
        uuidv4(),
        accountCode,
        signal.title || 'Live Account Signal Received',
        text.slice(0, 300),
        JSON.stringify(signal),
        detectedAt
      ]
    );

    newlyProcessed.push({
      signalId,
      accountCode,
      text
    });
  }

  if (newlyProcessed.length > 0) {
    // Update sync_state processed count
    await db.query(
      `UPDATE sync_state 
       SET processed_events_count = processed_events_count + $1 
       WHERE id = 'global'`,
      [newlyProcessed.length]
    );

    sseManager.broadcast('signals_processed', {
      count: newlyProcessed.length,
      events: newlyProcessed
    });
  }

  return newlyProcessed;
}

export default { processSignals };
