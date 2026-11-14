import db from '../database/db.js';

/**
 * Blind-Spot Finder / Intelligence-Gap Analysis
 * Identifies missing critical facts, unengaged stakeholders, and questions to ask
 */
export async function analyzeGaps(accountId) {
  const gapsRes = await db.query(
    `SELECT g.*, d.title as deal_title,
       e.excerpt as evidence_excerpt, e.source_id as evidence_source_id, e.source_type as evidence_source_type
     FROM intelligence_gaps g
     LEFT JOIN deals d ON d.id = g.deal_id
     LEFT JOIN evidence e ON e.id = g.evidence_id
     WHERE g.account_id = $1
     ORDER BY 
       CASE g.priority
         WHEN 'Critical' THEN 1
         WHEN 'High' THEN 2
         WHEN 'Medium' THEN 3
         ELSE 4
       END ASC,
       g.created_at DESC`,
    [accountId]
  );

  const gaps = gapsRes.rows;

  return {
    accountId,
    totalGaps: gaps.length,
    criticalGapsCount: gaps.filter(g => g.priority === 'Critical' || g.priority === 'High').length,
    gaps
  };
}

export default { analyzeGaps };
