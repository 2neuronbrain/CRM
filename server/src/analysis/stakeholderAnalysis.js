import db from '../database/db.js';

/**
 * Stakeholder Power Map Analysis
 * Evaluates influence, relationship roles, stance, and concerns
 */
export async function analyzeStakeholders(accountId) {
  // Query people and their associated deals & evidence
  const peopleRes = await db.query(
    `SELECT p.*,
       COALESCE(
         jsonb_agg(
           DISTINCT jsonb_build_object(
             'deal_id', ds.deal_id,
             'deal_title', d.title,
             'relationship_role', ds.relationship_role,
             'stance', ds.stance
           )
         ) FILTER (WHERE ds.deal_id IS NOT NULL), '[]'::jsonb
       ) AS deal_connections,
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
     LEFT JOIN deal_stakeholders ds ON ds.person_id = p.id
     LEFT JOIN deals d ON d.id = ds.deal_id
     LEFT JOIN evidence e ON e.account_id = p.account_id AND (e.excerpt ILIKE '%' || p.name || '%' OR e.source_id = p.external_id)
     WHERE p.account_id = $1
     GROUP BY p.id
     ORDER BY p.name ASC`,
    [accountId]
  );

  const people = peopleRes.rows.map(person => {
    const meta = person.metadata || {};
    return {
      ...person,
      dealConnections: person.deal_connections,
      evidence: person.evidence_list,
      concerns: meta.concerns || null,
      waitingFor: meta.waiting_for || null,
      unknownInfo: meta.unknown_info || null,
      isKeyDecisionMaker: ['Decision-maker', 'Economic buyer'].includes(person.role)
    };
  });

  const powerDistribution = {
    decisionMakers: people.filter(p => p.role === 'Decision-maker' || (p.dealConnections && p.dealConnections.some(d => d.relationship_role === 'Decision-maker'))),
    economicBuyers: people.filter(p => p.role === 'Economic buyer' || (p.dealConnections && p.dealConnections.some(d => d.relationship_role === 'Economic buyer'))),
    champions: people.filter(p => p.role === 'Champion' || p.stance === 'Supportive'),
    blockers: people.filter(p => p.role === 'Potential blocker' || p.stance === 'Resistant'),
    unengagedOrUnknown: people.filter(p => p.stance === 'Unknown' || p.role === 'Unknown')
  };

  return {
    accountId,
    totalPeople: people.length,
    people,
    powerDistribution
  };
}

export default { analyzeStakeholders };
