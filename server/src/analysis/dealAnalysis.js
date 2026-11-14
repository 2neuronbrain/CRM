import db from '../database/db.js';

/**
 * Deal & Book Value Intelligence Analysis
 * Evaluates verified vs reported deal values with supporting evidence
 */
export async function analyzeDeals(accountId) {
  const dealsRes = await db.query(
    `SELECT d.*, 
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
       ) AS evidence_list
     FROM deals d
     LEFT JOIN evidence e ON e.deal_id = d.id OR (e.account_id = d.account_id AND e.source_type IN ('contract', 'commercial', 'pricing', 'proposal', 'commercial_offer'))
     WHERE d.account_id = $1
     GROUP BY d.id
     ORDER BY d.amount DESC`,
    [accountId]
  );

  let verifiedTotal = 0;
  let reportedTotal = 0;
  let unvaluedDealsCount = 0;

  const deals = dealsRes.rows.map(deal => {
    const amount = parseFloat(deal.amount || 0);
    const isVerified = deal.verification_status === 'Verified' || deal.verification_status === 'Corroborated';
    const isReported = deal.verification_status === 'Reported';

    if (amount > 0) {
      if (isVerified) {
        verifiedTotal += amount;
      } else if (isReported) {
        reportedTotal += amount;
      }
    } else {
      unvaluedDealsCount += 1;
    }

    return {
      ...deal,
      amount,
      isVerified,
      evidence: deal.evidence_list || []
    };
  });

  return {
    accountId,
    totalVerifiedValue: verifiedTotal,
    totalReportedValue: reportedTotal,
    activeDealsCount: deals.length,
    unvaluedDealsCount,
    deals
  };
}

export default { analyzeDeals };
