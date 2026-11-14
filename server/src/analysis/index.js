import { analyzeDeals } from './dealAnalysis.js';
import { analyzeStakeholders } from './stakeholderAnalysis.js';
import { rankActions } from './actionRanking.js';
import { analyzeRisks } from './riskAnalysis.js';
import { analyzeGaps } from './gapAnalysis.js';
import { analyzeSentiment } from './sentimentAnalysis.js';
import { getAccountSummary } from './summaryAnalysis.js';
import db from '../database/db.js';

/**
 * Compiles complete 5-question intelligence + sentiment + executive summary for an account
 */
export async function getAccountIntelligence(accountId) {
  const accountRes = await db.query(`SELECT * FROM accounts WHERE id = $1`, [accountId]);
  if (accountRes.rows.length === 0) {
    return null;
  }
  const account = accountRes.rows[0];

  const [bookValue, powerMap, actions, riskRadar, blindSpots, sentiment, summary] = await Promise.all([
    analyzeDeals(accountId),
    analyzeStakeholders(accountId),
    rankActions(accountId),
    analyzeRisks(accountId),
    analyzeGaps(accountId),
    analyzeSentiment(accountId),
    getAccountSummary(accountId)
  ]);

  return {
    account,
    sentiment,
    summary,
    fiveQuestions: {
      question1_bookValue: {
        question: 'What is the book worth?',
        totalVerifiedValue: bookValue.totalVerifiedValue,
        totalReportedValue: bookValue.totalReportedValue,
        dealsCount: bookValue.activeDealsCount,
        unvaluedDealsCount: bookValue.unvaluedDealsCount,
        deals: bookValue.deals
      },
      question2_powerMap: {
        question: 'Who holds the power?',
        totalPeople: powerMap.totalPeople,
        people: powerMap.people,
        powerDistribution: powerMap.powerDistribution
      },
      question3_nextActions: {
        question: 'What should we do first?',
        top3Actions: actions.topActions,
        remainingActions: actions.remainingActions,
        allActions: actions.allActions
      },
      question4_riskRadar: {
        question: 'What is about to go wrong?',
        overallStatus: riskRadar.overallStatus,
        severityCounts: riskRadar.severityCounts,
        risks: riskRadar.risks
      },
      question5_blindSpots: {
        question: 'What do we still not know?',
        totalGaps: blindSpots.totalGaps,
        criticalGapsCount: blindSpots.criticalGapsCount,
        gaps: blindSpots.gaps
      }
    }
  };
}

/**
 * Global Dashboard Overview across all accounts
 */
export async function getGlobalDashboard() {
  const accountsRes = await db.query(`SELECT * FROM accounts ORDER BY name ASC`);
  const accounts = accountsRes.rows;

  let totalVerifiedBookValue = 0;
  let totalReportedValue = 0;
  let totalDeals = 0;
  let totalOpenRisks = 0;
  let totalUpcomingDeadlines = 0;
  let totalGaps = 0;

  const accountSummaries = [];

  for (const acc of accounts) {
    const intel = await getAccountIntelligence(acc.id);
    if (!intel) continue;

    totalVerifiedBookValue += intel.fiveQuestions.question1_bookValue.totalVerifiedValue;
    totalReportedValue += intel.fiveQuestions.question1_bookValue.totalReportedValue;
    totalDeals += intel.fiveQuestions.question1_bookValue.dealsCount;
    totalOpenRisks += intel.fiveQuestions.question4_riskRadar.risks.length;
    totalGaps += intel.fiveQuestions.question5_blindSpots.totalGaps;

    const now = Date.now();
    for (const act of intel.fiveQuestions.question3_nextActions.allActions) {
      if (act.deadline) {
        const d = new Date(act.deadline).getTime();
        if (d > now && d - now < 14 * 24 * 60 * 60 * 1000) {
          totalUpcomingDeadlines += 1;
        }
      }
    }

    accountSummaries.push({
      id: acc.id,
      name: acc.name,
      description: acc.description,
      verifiedBookValue: intel.fiveQuestions.question1_bookValue.totalVerifiedValue,
      reportedValue: intel.fiveQuestions.question1_bookValue.totalReportedValue,
      dealsCount: intel.fiveQuestions.question1_bookValue.dealsCount,
      riskStatus: intel.fiveQuestions.question4_riskRadar.overallStatus,
      sentiment: intel.sentiment,
      executiveSummary: intel.summary,
      topAction: intel.fiveQuestions.question3_nextActions.top3Actions[0] || null,
      topRisk: intel.fiveQuestions.question4_riskRadar.risks[0] || null,
      gapsCount: intel.fiveQuestions.question5_blindSpots.totalGaps
    });
  }

  // Fetch all priority tasks across accounts
  const actionsRes = await db.query(
    `SELECT a.*, d.title as deal_title, acc.name as account_name
     FROM actions a
     LEFT JOIN deals d ON d.id = a.deal_id
     LEFT JOIN accounts acc ON acc.id = a.account_id
     ORDER BY a.priority ASC, a.created_at ASC`
  );

  // Fetch recent activities
  const recentActivitiesRes = await db.query(
    `SELECT * FROM activities ORDER BY timestamp DESC LIMIT 15`
  );

  return {
    overview: {
      totalVerifiedBookValue,
      totalReportedValue,
      totalDeals,
      totalOpenRisks,
      totalUpcomingDeadlines,
      totalGaps
    },
    accounts: accountSummaries,
    priorityTasks: actionsRes.rows,
    recentActivity: recentActivitiesRes.rows
  };
}

export default {
  getAccountIntelligence,
  getGlobalDashboard
};
