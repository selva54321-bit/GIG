const amc = require('./amcMockService');

/**
 * GigCorpus Fund Management Service
 */

const ALLOCATION_SPLIT = {
  CLAIM_RESERVE: 0.45,
  GIG_CORPUS: 0.30,
  OPS_REINSURANCE: 0.25
};

/**
 * Handle allocation for a new premium payment
 */
const allocatePremium = (premiumAmount) => {
  const corpusAmount = premiumAmount * ALLOCATION_SPLIT.GIG_CORPUS;
  const reserveAmount = premiumAmount * ALLOCATION_SPLIT.CLAIM_RESERVE;
  const opsAmount = premiumAmount * ALLOCATION_SPLIT.OPS_REINSURANCE;

  return {
    corpus: parseFloat(corpusAmount.toFixed(2)),
    reserve: parseFloat(reserveAmount.toFixed(2)),
    ops: parseFloat(opsAmount.toFixed(2)),
    maturity_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  };
};

/**
 * Calculate Maturity Value after 52 weeks
 * @param {number} totalContribution 
 * @param {number} totalClaimsAgainstUser (Sum of all claims user received in the year)
 * @param {number} totalPremiumPaid (Sum of all premiums paid in the year)
 */
const calculateMaturity = (totalContribution, totalClaimsAgainstUser = 0, totalPremiumPaid = 1) => {
  // 1. Calculate Gross Return (7.2% p.a.)
  const grossReturn = totalContribution * amc.ANNUAL_RETURN_RATE;
  let finalValue = totalContribution + grossReturn;

  // 2. Claim Ratio Penalty (Morbidity/Loss Adjustment)
  // If Claims > 120% of Premium, reduce return proportionally
  const claimRatio = totalClaimsAgainstUser / totalPremiumPaid;
  if (claimRatio > 1.2) {
    const penaltyFactor = Math.min((claimRatio - 1.2) * 0.5, 1); // Max 100% of return loss
    const penalty = grossReturn * penaltyFactor;
    finalValue -= penalty;
    console.log(`[CorpusService] High Claim Ratio (${(claimRatio * 100).toFixed(1)}%) - Penalty of Rs. ${penalty.toFixed(2)} applied.`);
  }

  // 3. Deduct 1.5% Management Fee
  const mgmtFee = finalValue * amc.MGMT_FEE_RATE;
  finalValue -= mgmtFee;

  return {
    contribution: totalContribution,
    yield: finalValue - totalContribution,
    mgmt_fee: parseFloat(mgmtFee.toFixed(2)),
    final_payout: parseFloat(finalValue.toFixed(2))
  };
};

module.exports = { allocatePremium, calculateMaturity };
