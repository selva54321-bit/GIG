/**
 * Payout Calculation & Gateway Mock
 */

const TRIGGER_PAYOUT_MULTIPLIERS = {
    RAIN: 0.50,   // 50% of daily avg income
    HEAT: 0.40,
    AQI: 0.30,
    CURFEW: 0.80,
    FLOOD: 1.00   // 100% payout for severe floods
  };
  
  const calculatePayout = (dailyAvgIncome, triggerType, coverageDays = 1) => {
    const multiplier = TRIGGER_PAYOUT_MULTIPLIERS[triggerType] || 0.20;
    
    // Cap at 5 days
    const restrictedDays = Math.min(coverageDays, 5);
    
    const amount = dailyAvgIncome * multiplier * restrictedDays;
    return parseFloat(amount.toFixed(2));
  };
  
  const initiatePayoutMock = async (userId, amount, reason) => {
    console.log(`[Razorpay Mock] Payout of Rs. ${amount} initiated for User ${userId}. Reason: ${reason}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      payout_id: `pout_${Math.random().toString(36).substr(2, 9)}`,
      status: 'processed',
      utr: `UTR${Math.random().toString(10).substr(2, 12)}`
    };
  };
  
  module.exports = { calculatePayout, initiatePayoutMock };
