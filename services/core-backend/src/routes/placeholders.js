const express = require('express');
const claimsRouter = express.Router();
const gigscoreRouter = express.Router();
const corpusRouter = express.Router();
const { query } = require('../db/client');
const { calculateMaturity } = require('../services/corpusService');

function getPhoneNumber(req) {
  return req.user?.phone_number || '+919876543210';
}

function getTier(score) {
  if (score >= 800) return 'Elite';
  if (score >= 600) return 'Pro';
  if (score >= 400) return 'Standard';
  return 'Risk';
}

async function findUserByPhone(phoneNumber) {
  const result = await query('SELECT id, phone_number, current_gigscore FROM users WHERE phone_number = $1 LIMIT 1', [phoneNumber]);
  return result.rows[0] || null;
}

claimsRouter.get('/', async (req, res) => {
  const phoneNumber = getPhoneNumber(req);

  try {
    const claimRows = await query(
      `SELECT c.id, c.trigger_event, c.claim_amount, c.status, c.fraud_score, c.created_at
       FROM claims c
       JOIN policies p ON p.id = c.policy_id
       JOIN users u ON u.id = p.user_id
       WHERE u.phone_number = $1
       ORDER BY c.created_at DESC
       LIMIT 100`,
      [phoneNumber]
    );

    return res.json({
      success: true,
      source: 'database',
      claims: claimRows.rows.map((row) => ({
        id: row.id,
        trigger_event: row.trigger_event,
        claim_amount: Number(row.claim_amount),
        status: row.status,
        fraud_score: row.fraud_score === null ? null : Number(row.fraud_score),
        created_at: row.created_at,
      })),
    });
  } catch (dbError) {
    console.error('[Claims] DB unavailable, serving fallback response:', dbError.message);

    return res.json({
      success: true,
      source: 'fallback',
      claims: [
        {
          id: 'fallback_clm_001',
          trigger_event: 'RAIN',
          claim_amount: 504,
          status: 'APPROVED',
          fraud_score: 12,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ],
    });
  }
});

gigscoreRouter.get('/', async (req, res) => {
  const phoneNumber = getPhoneNumber(req);

  try {
    const user = await findUserByPhone(phoneNumber);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found for this token.',
      });
    }

    const historyRows = await query(
      `SELECT score, week_start_date, change_reason
       FROM gigscorehistory
       WHERE user_id = $1
       ORDER BY week_start_date DESC
       LIMIT 26`,
      [user.id]
    );

    return res.json({
      success: true,
      source: 'database',
      current_score: Number(user.current_gigscore),
      tier: getTier(Number(user.current_gigscore)),
      history: historyRows.rows.map((row) => ({
        score: Number(row.score),
        week_start_date: row.week_start_date,
        change_reason: row.change_reason,
      })),
    });
  } catch (dbError) {
    console.error('[GigScore] DB unavailable, serving fallback response:', dbError.message);

    return res.json({
      success: true,
      source: 'fallback',
      current_score: 850,
      tier: 'Elite',
      history: [],
    });
  }
});

corpusRouter.get('/', async (req, res) => {
  const phoneNumber = getPhoneNumber(req);

  try {
    const user = await findUserByPhone(phoneNumber);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found for this token.',
      });
    }

    const ledgerAgg = await query(
      `SELECT
         COALESCE(SUM(amount_invested), 0)::float AS total_invested,
         COUNT(*)::int AS entries,
         MIN(investment_date) AS first_investment,
         MAX(maturity_date) AS latest_maturity
       FROM gigcorpusledger
       WHERE user_id = $1`,
      [user.id]
    );

    const lossRatioInputs = await query(
      `SELECT
         COALESCE(SUM(p.premium_amount), 0)::float AS total_premium,
         COALESCE(SUM(c.claim_amount), 0)::float AS total_claims
       FROM policies p
       LEFT JOIN claims c ON c.policy_id = p.id
       WHERE p.user_id = $1`,
      [user.id]
    );

    const totalContribution = Number(ledgerAgg.rows[0].total_invested || 0);
    const totalPremium = Number(lossRatioInputs.rows[0].total_premium || 0);
    const totalClaims = Number(lossRatioInputs.rows[0].total_claims || 0);

    const maturity = calculateMaturity(totalContribution, totalClaims, totalPremium || 1);

    return res.json({
      success: true,
      source: 'database',
      balance: totalContribution,
      projected_yield: maturity.yield,
      projected_final_payout: maturity.final_payout,
      management_fee: maturity.mgmt_fee,
      entries: ledgerAgg.rows[0].entries,
      first_investment: ledgerAgg.rows[0].first_investment,
      latest_maturity: ledgerAgg.rows[0].latest_maturity,
    });
  } catch (dbError) {
    console.error('[Corpus] DB unavailable, serving fallback response:', dbError.message);

    return res.json({
      success: true,
      source: 'fallback',
      balance: 1240.5,
      projected_yield: 135.2,
      projected_final_payout: 1375.7,
      management_fee: 20.94,
      entries: 18,
      first_investment: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      latest_maturity: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000),
    });
  }
});

module.exports = {
  claims: claimsRouter,
  gigscore: gigscoreRouter,
  corpus: corpusRouter,
};
