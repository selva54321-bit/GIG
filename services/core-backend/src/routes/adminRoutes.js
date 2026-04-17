const express = require('express');
const router = express.Router();
const { query } = require('../db/client');
const { PORTFOLIO_WEIGHTS } = require('../services/amcMockService');
const { getWeatherData, getAQIData, getGovtAlerts } = require('../services/mockApis');

const ZONES_TO_MONITOR = ['Mumbai_Andheri', 'Delhi_NCR', 'Chennai_Tnagar', 'Bangalore_Indiranagar'];

function getCurrentWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function mockAnalyticsSummary() {
  return {
    active_policies: 10247,
    weekly_inflow: 3970000,
    corpus_aum: 62000000,
    monthly_loss_ratio_pct: 52,
  };
}

router.get('/analytics/summary', async (req, res) => {
  try {
    const weekStart = getCurrentWeekStart();

    const [activePolicies, weeklyInflow, corpusAum, premiumTotals, claimTotals] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total FROM policies WHERE status = 'ACTIVE'`),
      query(`SELECT COALESCE(SUM(premium_amount), 0)::float AS amount FROM policies WHERE created_at >= $1`, [weekStart]),
      query(`SELECT COALESCE(SUM(amount_invested), 0)::float AS aum FROM gigcorpusledger`),
      query(`SELECT COALESCE(SUM(premium_amount), 0)::float AS total FROM policies WHERE created_at >= date_trunc('month', NOW())`),
      query(
        `SELECT COALESCE(SUM(c.claim_amount), 0)::float AS total
         FROM claims c
         WHERE c.created_at >= date_trunc('month', NOW())`
      ),
    ]);

    const monthlyPremium = Number(premiumTotals.rows[0]?.total || 0);
    const monthlyClaims = Number(claimTotals.rows[0]?.total || 0);
    const lossRatio = monthlyPremium > 0 ? (monthlyClaims / monthlyPremium) * 100 : 0;

    return res.json({
      success: true,
      source: 'database',
      summary: {
        active_policies: Number(activePolicies.rows[0]?.total || 0),
        weekly_inflow: Number(weeklyInflow.rows[0]?.amount || 0),
        corpus_aum: Number(corpusAum.rows[0]?.aum || 0),
        monthly_loss_ratio_pct: Number(lossRatio.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('[Admin Analytics] DB unavailable, serving fallback response:', error.message);

    return res.json({
      success: true,
      source: 'fallback',
      summary: mockAnalyticsSummary(),
    });
  }
});

router.get('/fraud-queue', async (req, res) => {
  try {
    const result = await query(
      `SELECT
         c.id,
         c.policy_id,
         c.trigger_event,
         c.claim_amount,
         c.status,
         c.fraud_score,
         c.created_at,
         u.phone_number
       FROM claims c
       JOIN policies p ON p.id = c.policy_id
       JOIN users u ON u.id = p.user_id
       WHERE c.status IN ('FRAUD_FLAGGED', 'PENDING') OR COALESCE(c.fraud_score, 0) >= 50
       ORDER BY COALESCE(c.fraud_score, 0) DESC, c.created_at DESC
       LIMIT 100`
    );

    return res.json({
      success: true,
      source: 'database',
      queue: result.rows.map((row) => ({
        id: row.id,
        policy_id: row.policy_id,
        phone_number: row.phone_number,
        trigger_event: row.trigger_event,
        claim_amount: Number(row.claim_amount),
        status: row.status,
        fraud_score: row.fraud_score === null ? null : Number(row.fraud_score),
        created_at: row.created_at,
      })),
    });
  } catch (error) {
    console.error('[Admin Fraud Queue] DB unavailable, serving fallback response:', error.message);

    return res.json({
      success: true,
      source: 'fallback',
      queue: [
        {
          id: 'fallback_clm_2901',
          policy_id: 'fallback_pol_12345',
          phone_number: '+919876543210',
          trigger_event: 'RAIN',
          claim_amount: 504,
          status: 'FRAUD_FLAGGED',
          fraud_score: 71,
          created_at: new Date(),
        },
      ],
    });
  }
});

router.get('/triggers/live', async (req, res) => {
  const triggers = ZONES_TO_MONITOR.map((zone) => {
    const weather = getWeatherData(zone);
    const aqi = getAQIData(zone);
    const govt = getGovtAlerts(zone);

    return {
      zone,
      weather,
      aqi,
      govt_alerts: govt.alerts,
      statuses: {
        rain: weather.rain_mm > 64.5 ? 'triggered' : 'safe',
        heat: weather.temperature > 45 ? 'triggered' : 'safe',
        aqi: aqi.aqi > 400 ? 'triggered' : aqi.aqi >= 300 ? 'warning' : 'safe',
        flood: govt.alerts.includes('FLOOD_WARNING') ? 'triggered' : 'safe',
        curfew: govt.alerts.includes('MOVEMENT_RESTRICTED') ? 'triggered' : 'safe',
      },
    };
  });

  return res.json({
    success: true,
    source: 'simulated',
    triggers,
  });
});

router.get('/corpus/summary', async (req, res) => {
  try {
    const [aumResult, contributorsResult] = await Promise.all([
      query(`SELECT COALESCE(SUM(amount_invested), 0)::float AS total_aum FROM gigcorpusledger`),
      query(`SELECT COUNT(DISTINCT user_id)::int AS contributors FROM gigcorpusledger`),
    ]);

    const totalAum = Number(aumResult.rows[0]?.total_aum || 0);

    const portfolio = [
      { name: 'G-Secs', weight: PORTFOLIO_WEIGHTS.G_SEC },
      { name: 'RBI Bonds', weight: PORTFOLIO_WEIGHTS.RBI_BONDS },
      { name: 'Liquid Funds', weight: PORTFOLIO_WEIGHTS.LIQUID_FUNDS },
      { name: 'Debt Funds', weight: PORTFOLIO_WEIGHTS.DEBT_FUNDS },
      { name: 'Cash', weight: PORTFOLIO_WEIGHTS.CASH },
    ].map((item) => ({
      ...item,
      amount: Number((totalAum * item.weight).toFixed(2)),
    }));

    return res.json({
      success: true,
      source: 'database',
      summary: {
        total_aum: totalAum,
        contributors: Number(contributorsResult.rows[0]?.contributors || 0),
        portfolio,
      },
    });
  } catch (error) {
    console.error('[Admin Corpus Summary] DB unavailable, serving fallback response:', error.message);

    return res.json({
      success: true,
      source: 'fallback',
      summary: {
        total_aum: 62000000,
        contributors: 9841,
        portfolio: [
          { name: 'G-Secs', weight: PORTFOLIO_WEIGHTS.G_SEC, amount: 24800000 },
          { name: 'RBI Bonds', weight: PORTFOLIO_WEIGHTS.RBI_BONDS, amount: 15500000 },
          { name: 'Liquid Funds', weight: PORTFOLIO_WEIGHTS.LIQUID_FUNDS, amount: 12400000 },
          { name: 'Debt Funds', weight: PORTFOLIO_WEIGHTS.DEBT_FUNDS, amount: 6200000 },
          { name: 'Cash', weight: PORTFOLIO_WEIGHTS.CASH, amount: 3100000 },
        ],
      },
    });
  }
});

module.exports = router;
