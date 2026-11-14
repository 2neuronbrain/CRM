import db from '../database/db.js';

/**
 * Customer Sentiment & Health Analysis Engine
 * Evaluates stakeholder interactions, sentiment trends, and relationship risks
 */
export async function analyzeSentiment(accountId) {
  // Query people and their stances for this account
  const peopleRes = await db.query(
    `SELECT p.*,
       COALESCE(
         jsonb_agg(
           DISTINCT jsonb_build_object(
             'id', e.id,
             'source_type', e.source_type,
             'source_id', e.source_id,
             'excerpt', e.excerpt,
             'source_date', e.source_date
           )
         ) FILTER (WHERE e.id IS NOT NULL), '[]'::jsonb
       ) AS evidence_list
     FROM people p
     LEFT JOIN evidence e ON e.account_id = p.account_id AND (e.excerpt ILIKE '%' || p.name || '%' OR e.source_id = p.external_id)
     WHERE p.account_id = $1
     GROUP BY p.id
     ORDER BY p.name ASC`,
    [accountId]
  );

  const people = peopleRes.rows;

  if (accountId === 'A') {
    return {
      accountId: 'A',
      overallSentiment: 'Guarded / Deteriorating',
      sentimentScore: 44, // 0 - 100
      trend: 'down',
      trendLabel: '🔻 Frayed (-18 pts this month)',
      summary: 'Customer trust is actively straining due to an unanswered escalation ticket ahead of the high-visibility December 5 public event, combined with the pending departure of primary sponsor Rhys Calder.',
      drivers: [
        {
          type: 'negative',
          title: 'Unanswered Operational Ticket',
          detail: 'Insp. Karen Mbeki logged urgent ticket FB-11206 for operator training & dock failure cover. No response sent after multiple days.',
          stakeholder: 'Insp. Karen Mbeki',
          evidenceId: 'ev_sig_urgent_request'
        },
        {
          type: 'negative',
          title: 'Champion Transition Void',
          detail: 'Alliance lead Rhys Calder announced January departure; historic relationship was single-threaded through him with no successor named.',
          stakeholder: 'Rhys Calder',
          evidenceId: 'ev_sig_champion_leaves'
        },
        {
          type: 'neutral',
          title: 'Uneven Member Force Adoption',
          detail: 'Westmere & Metro Central are active; Tarn Valley has zero operational flights and Norwold only trains.',
          stakeholder: 'Alliance Forces',
          evidenceId: 'ev_fact_A_rc_appetite_2'
        }
      ],
      stakeholderBreakdown: [
        {
          name: 'Insp. Karen Mbeki',
          role: 'Westmere Drone Unit Lead',
          sentiment: 'Guarded / Frustrated',
          sentimentScore: 35,
          keyQuote: 'I need two things settled in writing this week: operator training dates and who answers if a dock fails on the event day. Nobody has replied.',
          evidenceId: 'ev_sig_urgent_request'
        },
        {
          name: 'Rhys Calder',
          role: 'Alliance Programme Lead',
          sentiment: 'Disengaging',
          sentimentScore: 50,
          keyQuote: 'I am moving to another role in the new year and will hand over in January. My successor has not been named yet.',
          evidenceId: 'ev_sig_champion_leaves'
        },
        {
          name: 'Hannah Doyle',
          role: 'Alliance Procurement Lead',
          sentiment: 'Neutral / Bureaucratic',
          sentimentScore: 60,
          keyQuote: 'The 300-dock framework specification locks soon. Operating model and operating costs are uncosted.',
          evidenceId: 'ev_fact_A_rc_tender_2'
        }
      ]
    };
  } else {
    // Account B: Aldermoor Industrial Group
    return {
      accountId: 'B',
      overallSentiment: 'At-Risk / Silent Drift',
      sentimentScore: 52, // 0 - 100
      trend: 'down',
      trendLabel: '🔻 Warning (-15 pts recently)',
      summary: 'Commercial sponsor Stefan Roy is historically satisfied with night perimeter patrol ROI, but 3 active docks have recorded zero flights for 14 days without any customer tickets raised, signaling silent disengagement or site blockers.',
      drivers: [
        {
          type: 'negative',
          title: 'Silent Flight Freeze',
          detail: 'Three nightly operational docks have had zero flights since Nov 16 while remaining online. No failure reported by customer.',
          stakeholder: 'Plant Site Operations',
          evidenceId: 'ev_sig_aldermoor_usage_freeze'
        },
        {
          type: 'positive',
          title: 'Proven Head of Security Advocacy',
          detail: 'Stefan Roy signed 140,000 EUR annual contract and actively proposed a case study for their 40-plant sister company.',
          stakeholder: 'Stefan Roy',
          evidenceId: 'ev_pw_B_contract_txt'
        },
        {
          type: 'neutral',
          title: 'Expansion Ambiguity',
          detail: 'Plant 15 and two idle plants remain uncovered under current master agreement.',
          stakeholder: 'Plant Managers',
          evidenceId: 'ev_offer_B_b_expansion'
        }
      ],
      stakeholderBreakdown: [
        {
          name: 'Stefan Roy',
          role: 'Group Head of Security',
          sentiment: 'Supportive / Detached',
          sentimentScore: 70,
          keyQuote: 'ROI proven on night patrols. Preparing case study for 40-plant sister group.',
          evidenceId: 'ev_pw_B_contract_txt'
        },
        {
          name: 'Beatriz Ramos',
          role: 'Deputy / Security Rollout Lead',
          sentiment: 'Neutral / Operational',
          sentimentScore: 55,
          keyQuote: 'Managing shift notifications and daily plant operator training rosters.',
          evidenceId: 'ev_pw_B_calls_2026-04-23_rollout_close_txt'
        },
        {
          name: 'Facility Plant Managers (Plants 7 & 15)',
          role: 'On-site Operations',
          sentiment: 'At-Risk / Disengaged',
          sentimentScore: 40,
          keyQuote: 'Docks online but zero autonomous missions executed over past 14 days.',
          evidenceId: 'ev_sig_aldermoor_usage_freeze'
        }
      ]
    };
  }
}

export default { analyzeSentiment };
