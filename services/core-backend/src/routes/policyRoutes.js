const express = require('express');
const { randomUUID } = require('crypto');
const router = express.Router();
const { calculatePremium } = require('../utils/premium');
const { calculateWeeklyCycle } = require('../utils/cycle');
const { query } = require('../db/client');

const ALLOWED_PLATFORMS = ['Zepto', 'Swiggy', 'Zomato', 'Other'];

function normalizePlatform(platform) {
  if (ALLOWED_PLATFORMS.includes(platform)) return platform;
  return 'Zepto';
}

function toIso(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function mapPolicyRow(row) {
  return {
    id: row.id,
    type: row.type,
    premium: Number(row.premium_amount),
    corpus_contribution: Number(row.corpus_contribution),
    starts: toIso(row.start_date),
    ends: toIso(row.end_date),
    status: row.status,
  };
}

function fallbackPolicy(pricing, cycle) {
  return {
    id: `fallback_${Date.now()}`,
    type: 'INCOME_PROTECTION',
    premium: pricing.base_premium,
    corpus_contribution: pricing.corpus_contribution,
    starts: cycle.start_date,
    ends: cycle.end_date,
    status: 'ACTIVE',
  };
}

async function findUserByPhone(phoneNumber) {
  const result = await query(
    'SELECT id, phone_number, platform_id, zone, current_gigscore FROM users WHERE phone_number = $1 LIMIT 1',
    [phoneNumber]
  );

  return result.rows[0] || null;
}

async function ensureUser(phoneNumber, gigScore, platform) {
  const existing = await findUserByPhone(phoneNumber);
  if (existing) {
    await query('UPDATE users SET current_gigscore = $1, updated_at = NOW() WHERE id = $2', [gigScore, existing.id]);
    return existing;
  }

  const created = await query(
    `INSERT INTO users (id, phone_number, platform_id, zone, current_gigscore)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, phone_number, platform_id, zone, current_gigscore`,
    [randomUUID(), phoneNumber, normalizePlatform(platform), 'Mumbai_Andheri', gigScore]
  );

  return created.rows[0];
}

/**
 * @route POST /api/policy/purchase
 * @desc Purchase a new weekly income protection policy
 */
router.post('/purchase', async (req, res) => {
  const { gigScore, type } = req.body;
  const phoneNumber = req.user?.phone_number || req.body.phone_number || '+919876543210';
  const platform = req.body.platform || 'Zepto';

  const parsedScore = Number(gigScore);
  if (!Number.isFinite(parsedScore)) {
    return res.status(400).json({
      success: false,
      message: 'gigScore is required and must be a valid number.',
    });
  }

  try {
    const pricing = calculatePremium(parsedScore, type);
    const cycle = calculateWeeklyCycle();

    try {
      const user = await ensureUser(phoneNumber, parsedScore, platform);

      const insertedPolicy = await query(
        `INSERT INTO policies (id, user_id, type, premium_amount, corpus_contribution, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
         RETURNING id, type, premium_amount, corpus_contribution, start_date, end_date, status`,
        [
          randomUUID(),
          user.id,
          'INCOME_PROTECTION',
          pricing.base_premium,
          pricing.corpus_contribution,
          cycle.start_date,
          cycle.end_date,
        ]
      );

      await query(
        `INSERT INTO gigcorpusledger (id, user_id, policy_id, amount_invested, maturity_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          randomUUID(),
          user.id,
          insertedPolicy.rows[0].id,
          pricing.corpus_contribution,
          new Date(new Date(cycle.end_date).setFullYear(new Date(cycle.end_date).getFullYear() + 1)),
        ]
      );

      return res.status(201).json({
        success: true,
        source: 'database',
        policy: mapPolicyRow(insertedPolicy.rows[0]),
      });
    } catch (dbError) {
      console.error('[Policy Purchase] DB unavailable, serving fallback response:', dbError.message);

      return res.status(201).json({
        success: true,
        source: 'fallback',
        policy: fallbackPolicy(pricing, cycle),
      });
    }
  } catch (error) {
    res.status(403).json({ success: false, error: error.message });
  }
});

router.get('/active', async (req, res) => {
  const phoneNumber = req.user?.phone_number || '+919876543210';

  try {
    const activePolicy = await query(
      `SELECT p.id, p.type, p.premium_amount, p.corpus_contribution, p.start_date, p.end_date, p.status
       FROM policies p
       JOIN users u ON u.id = p.user_id
       WHERE u.phone_number = $1 AND p.status = 'ACTIVE'
       ORDER BY p.start_date DESC
       LIMIT 1`,
      [phoneNumber]
    );

    if (activePolicy.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active policy found for this user.',
      });
    }

    return res.json({
      success: true,
      source: 'database',
      policy: mapPolicyRow(activePolicy.rows[0]),
    });
  } catch (dbError) {
    console.error('[Policy Active] DB unavailable, serving fallback response:', dbError.message);

    return res.json({
      success: true,
      source: 'fallback',
      policy: {
        id: 'fallback_active_policy',
        type: 'INCOME_PROTECTION',
        premium: 39,
        corpus_contribution: 11.7,
        starts: new Date(new Date().setHours(0, 0, 0, 0)),
        ends: new Date(new Date().setDate(new Date().getDate() + 6)),
        status: 'ACTIVE',
      },
    });
  }
});

module.exports = router;
