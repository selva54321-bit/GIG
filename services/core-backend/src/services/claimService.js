const { calculatePayout, initiatePayoutMock } = require('../utils/payout');
const { sendNotification } = require('./notificationService');

/**
 * Zero-Touch Claim Service
 */

// Mocked DB lookup for demonstration
const mockGetActivePoliciesInZone = async (zone) => {
  // Simulating a database query
  // For 'Mumbai_Andheri', we have our seed user with phone +919876543210
  if (zone === 'Mumbai_Andheri') {
    return [
      {
        id: 'pol_12345',
        user_id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
        phone_number: '+919876543210',
        daily_avg_income: 800,
        status: 'ACTIVE'
      }
    ];
  }
  return [];
};

const processAutoClaim = async (zone, triggerType) => {
  console.log(`[Auto-Claim] Processing disruption: ${triggerType} in zone ${zone}`);

  const activePolicies = await mockGetActivePoliciesInZone(zone);

  for (const policy of activePolicies) {
    // 1. Cross-Check GPS (Mocked: Assume worker is in the zone they subscribed to)
    const isWorkerInZone = true; 

    // 2. Platform Activity Check (Mocked: Ensure worker isn't earning)
    const isActiveOnPlatform = false; 

    if (isWorkerInZone && !isActiveOnPlatform) {
      const payoutAmount = calculatePayout(policy.daily_avg_income, triggerType, 1);
      
      // 3. Initiate Payout
      const payoutResult = await initiatePayoutMock(policy.user_id, payoutAmount, triggerType);
      
      // 4. Send Notification
      const message = `GigShield Alert: ${triggerType} detected in ${zone}. Auto-payout of Rs. ${payoutAmount} initiated. Ref: ${payoutResult.utr}`;
      sendNotification(policy.phone_number, message);
      
      console.log(`[Auto-Claim] Claim fully processed for ${policy.user_id}`);
    }
  }
};

module.exports = { processAutoClaim };
