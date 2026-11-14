import db from '../database/db.js';

/**
 * Risk Radar Engine
 * Analyzes approaching deadlines, communication lags, stakeholder shifts, and usage drops
 */
export async function analyzeRisks(accountId) {
  const risksRes = await db.query(
    `SELECT r.*, d.title as deal_title,
       e.excerpt as evidence_excerpt, e.source_id as evidence_source_id, e.source_type as evidence_source_type,
       e.source_date as evidence_source_date
     FROM risks r
     LEFT JOIN deals d ON d.id = r.deal_id
     LEFT JOIN evidence e ON e.id = r.evidence_id
     WHERE r.account_id = $1
     ORDER BY 
       CASE r.severity
         WHEN 'Red' THEN 1
         WHEN 'Amber' THEN 2
         WHEN 'Green' THEN 3
         ELSE 4
       END ASC,
       r.detected_at DESC`,
    [accountId]
  );

  const risks = risksRes.rows;

  const severityCounts = {
    red: risks.filter(r => r.severity === 'Red').length,
    amber: risks.filter(r => r.severity === 'Amber').length,
    green: risks.filter(r => r.severity === 'Green').length,
    unknown: risks.filter(r => r.severity === 'Unknown').length
  };

  // Determine overall health rating
  let overallStatus = 'Green';
  if (severityCounts.red > 0) {
    overallStatus = 'Red';
  } else if (severityCounts.amber > 0) {
    overallStatus = 'Amber';
  } else if (risks.length === 0) {
    overallStatus = 'Unknown';
  }

  return {
    accountId,
    overallStatus,
    severityCounts,
    totalRisks: risks.length,
    risks
  };
}

export default { analyzeRisks };
