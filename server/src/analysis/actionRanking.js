import db from '../database/db.js';

/**
 * Deterministic, Explainable Action Ranking Algorithm
 * Dimensions:
 * 1. Deal Value (Normalized 0 to 40 points)
 * 2. Likelihood of Success (Documented indicator: 0 to 30 points)
 * 3. Urgency / Days to Deadline (0 to 30 points)
 */
export function calculateActionScore(action, associatedDeal) {
  let valueScore = 0;
  let likelihoodScore = 15; // default moderate likelihood
  let urgencyScore = 0;
  const reasons = [];

  // 1. Deal Value Score (max 40)
  const dealAmount = associatedDeal ? parseFloat(associatedDeal.amount || 0) : 0;
  if (dealAmount > 50000) {
    valueScore = 40;
    reasons.push(`high deal value ($${dealAmount.toLocaleString()})`);
  } else if (dealAmount > 10000) {
    valueScore = 25;
    reasons.push(`moderate deal value ($${dealAmount.toLocaleString()})`);
  } else if (dealAmount > 0) {
    valueScore = 15;
    reasons.push(`established deal value ($${dealAmount.toLocaleString()})`);
  } else {
    valueScore = 5;
    reasons.push('strategic account action without direct deal amount');
  }

  // 2. Likelihood of Success (max 30)
  // Higher if assigned owner exists and action addresses a known gap or customer question
  if (action.owner && action.owner !== 'Unassigned') {
    likelihoodScore += 10;
  }
  if (action.title.toLowerCase().includes('confirm') || action.title.toLowerCase().includes('training') || action.title.toLowerCase().includes('respond')) {
    likelihoodScore += 5;
    reasons.push('clear operational deliverable');
  }

  // 3. Deadline Urgency (max 30)
  if (action.deadline) {
    const deadlineDate = new Date(action.deadline);
    if (!isNaN(deadlineDate.getTime())) {
      const diffDays = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) {
        urgencyScore = 30;
        reasons.push(`critical imminent deadline in ${diffDays} day(s)`);
      } else if (diffDays <= 7) {
        urgencyScore = 25;
        reasons.push(`urgent deadline within a week (${diffDays} days)`);
      } else if (diffDays <= 14) {
        urgencyScore = 15;
        reasons.push(`approaching deadline in ${diffDays} days`);
      } else {
        urgencyScore = 10;
        reasons.push(`scheduled deadline (${diffDays} days away)`);
      }
    } else {
      urgencyScore = 15;
      reasons.push(`deadline indicated: ${action.deadline}`);
    }
  } else {
    urgencyScore = 5;
  }

  const totalScore = valueScore + likelihoodScore + urgencyScore;
  const explanation = `Priority score ${totalScore}/100: Ranked based on ${reasons.join(', ')}.`;

  return { totalScore, explanation };
}

export async function rankActions(accountId) {
  const actionsRes = await db.query(
    `SELECT a.*, d.title as deal_title, d.amount as deal_amount,
       e.excerpt as evidence_excerpt, e.source_id as evidence_source_id, e.source_type as evidence_source_type
     FROM actions a
     LEFT JOIN deals d ON d.id = a.deal_id
     LEFT JOIN evidence e ON e.id = a.evidence_id
     WHERE a.account_id = $1
     ORDER BY a.priority ASC`,
    [accountId]
  );

  const scoredActions = actionsRes.rows.map(action => {
    const associatedDeal = action.deal_amount ? { amount: action.deal_amount } : null;
    const { totalScore, explanation } = calculateActionScore(action, associatedDeal);
    return {
      ...action,
      calculatedScore: totalScore,
      deterministicReasoning: action.reasoning || explanation
    };
  });

  // Sort descending by calculated score
  scoredActions.sort((a, b) => b.calculatedScore - a.calculatedScore);

  // Assign 1, 2, 3...
  scoredActions.forEach((act, idx) => {
    act.rank = idx + 1;
  });

  return {
    accountId,
    topActions: scoredActions.slice(0, 3),
    remainingActions: scoredActions.slice(3),
    allActions: scoredActions
  };
}

export default { calculateActionScore, rankActions };
