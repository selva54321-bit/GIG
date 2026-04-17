const { randomUUID } = require('crypto');
const { calculatePayout, initiatePayoutMock } = require('../utils/payout');
const { sendNotification } = require('./notificationService');
const { detectFraudRisk } = require('../utils/mlClient');
const { query } = require('../db/client');
const { getErrorMessage } = require('../utils/errors');

/**
 * Zero-Touch Claim Service
 */

const FALLBACK_DAILY_INCOME = 800;

const estimateDailyIncome = (gigScore = 500) => {
  if (gigScore >= 800) return 900;
  if (gigScore >= 600) return 750;
  if (gigScore >= 400) return 650;
  return 550;
};

// Fallback lookup for prototype mode when DB is unavailable
const mockGetActivePoliciesInZone = async (zone) => {
  if (zone === 'Mumbai_Andheri') {
    return [
      {
        id: 'fallback_pol_12345',
        user_id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
        phone_number: '+919876543210',
        zone: zone,
        current_gigscore: 850,
        daily_avg_income: FALLBACK_DAILY_INCOME,
        status: 'ACTIVE',
      },
    ];
  }

  return [];
};

const getActivePoliciesInZone = async (zone) => {
  try {
    const result = await query(
      `SELECT
         p.id,
         p.user_id,
         p.status,
         u.phone_number,
         u.zone,
         u.current_gigscore
       FROM policies p
       JOIN users u ON u.id = p.user_id
       WHERE p.status = 'ACTIVE' AND u.zone = $1`,
      [zone]
    );

    return {
      source: 'database',
      policies: result.rows.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        status: row.status,
        phone_number: row.phone_number,
        zone: row.zone,
        current_gigscore: Number(row.current_gigscore || 500),
        daily_avg_income: estimateDailyIncome(Number(row.current_gigscore || 500)),
      })),
    };
  } catch (error) {
    console.error('[Auto-Claim] DB unavailable, using fallback active-policy lookup:', getErrorMessage(error));
    return {
      source: 'fallback',
      policies: await mockGetActivePoliciesInZone(zone),
    };
  }
};

const hasRecentClaim = async (policyId, triggerType, lookbackHours = 6) => {
  const result = await query(
    `SELECT id
     FROM claims
     WHERE policy_id = $1
       AND trigger_event = $2
       AND created_at > NOW() - ($3 || ' hours')::interval
     LIMIT 1`,
    [policyId, triggerType, String(lookbackHours)]
  );

  return result.rows.length > 0;
};

const getClaimsCountLast7d = async (userId) => {
  const result = await query(
    `SELECT COUNT(*)::int AS claim_count
     FROM claims c
     JOIN policies p ON p.id = c.policy_id
     WHERE p.user_id = $1
       AND c.created_at > NOW() - interval '7 days'`,
    [userId]
  );

  return Number(result.rows[0]?.claim_count || 0);
};

const mapDecisionToStatus = (decision) => {
  if (decision === 'APPROVE') return 'APPROVED';
  if (decision === 'REJECT') return 'REJECTED';
  return 'FRAUD_FLAGGED';
};

const persistClaimAndFraudLog = async ({ policy, triggerType, payoutAmount, fraudResult, claimsCount7d }) => {
  const claimStatus = mapDecisionToStatus(fraudResult.decision);

  const claimInsert = await query(
    `INSERT INTO claims (id, policy_id, trigger_event, claim_amount, status, fraud_score, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING id, status, claim_amount`,
    [
      randomUUID(),
      policy.id,
      triggerType,
      payoutAmount,
      claimStatus,
      Number(fraudResult.fraud_risk_score || 0),
    ]
  );

  const claimId = claimInsert.rows[0].id;

  await query(
    `INSERT INTO fraudlogs (
       id, claim_id,
       gps_check_passed, zone_check_passed, velocity_check_passed, graph_check_passed, score_check_passed,
       final_decision, created_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
    [
      randomUUID(),
      claimId,
      true,
      true,
      claimsCount7d <= 3,
      true,
      policy.current_gigscore >= 100,
      fraudResult.decision,
    ]
  );

  return {
    id: claimId,
    status: claimInsert.rows[0].status,
    claim_amount: Number(claimInsert.rows[0].claim_amount),
  };
};

const processFallbackAutoClaim = async (zone, triggerType, policies) => {
  for (const policy of policies) {
    const payoutAmount = calculatePayout(policy.daily_avg_income, triggerType, 1);
    const payoutResult = await initiatePayoutMock(policy.user_id, payoutAmount, triggerType);
    const message = `GigShield Alert: ${triggerType} detected in ${zone}. Auto-payout of Rs. ${payoutAmount} initiated. Ref: ${payoutResult.utr}`;
    sendNotification(policy.phone_number, message);
    console.log(`[Auto-Claim:FALLBACK] Claim simulated for ${policy.user_id}`);
  }
};

const processAutoClaim = async (zone, triggerType) => {
  console.log(`[Auto-Claim] Processing disruption: ${triggerType} in zone ${zone}`);

  const lookup = await getActivePoliciesInZone(zone);
  const activePolicies = lookup.policies;

  if (!activePolicies.length) {
    console.log(`[Auto-Claim] No active policies found in zone ${zone}`);
    return;
  }

  if (lookup.source === 'fallback') {
    await processFallbackAutoClaim(zone, triggerType, activePolicies);
    return;
  }

  for (const policy of activePolicies) {
    try {
      const duplicate = await hasRecentClaim(policy.id, triggerType, 6);
      if (duplicate) {
        console.log(`[Auto-Claim] Skipped duplicate claim for policy ${policy.id} (${triggerType})`);
        continue;
      }

      // Mocked checks for prototype; replace with live telemetry integrations later.
      const isWorkerInZone = true;
      const isActiveOnPlatform = false;

      if (!(isWorkerInZone && !isActiveOnPlatform)) {
        continue;
      }

      const payoutAmount = calculatePayout(policy.daily_avg_income, triggerType, 1);
      const claimsCount7d = await getClaimsCountLast7d(policy.user_id);

      const fraudResult = await detectFraudRisk({
        user_id: policy.user_id,
        gps_valid: true,
        zone_changes_month: 0,
        claims_count_7d: claimsCount7d,
        device_id_shared: false,
        gig_score: policy.current_gigscore,
      });

      const claim = await persistClaimAndFraudLog({
        policy,
        triggerType,
        payoutAmount,
        fraudResult,
        claimsCount7d,
      });

      if (claim.status === 'APPROVED') {
        const payoutResult = await initiatePayoutMock(policy.user_id, payoutAmount, triggerType);
        const approvedMessage = `GigShield Alert: ${triggerType} detected in ${zone}. Claim ${claim.id} approved and payout of Rs. ${payoutAmount} initiated. Ref: ${payoutResult.utr}`;
        sendNotification(policy.phone_number, approvedMessage);
      } else if (claim.status === 'REJECTED') {
        const rejectMessage = `GigShield Alert: Claim ${claim.id} for ${triggerType} was rejected due to high fraud risk score (${Math.round(fraudResult.fraud_risk_score)}).`;
        sendNotification(policy.phone_number, rejectMessage);
      } else {
        const reviewMessage = `GigShield Alert: Claim ${claim.id} for ${triggerType} is flagged for review. No payout has been initiated yet.`;
        sendNotification(policy.phone_number, reviewMessage);
      }

      console.log(`[Auto-Claim] Claim stored for ${policy.user_id} with status ${claim.status}`);
    } catch (error) {
      console.error(`[Auto-Claim] Failed processing policy ${policy.id}:`, getErrorMessage(error));
    }
  }
};

module.exports = { processAutoClaim };
