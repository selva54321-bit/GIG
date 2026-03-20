/**
 * Base Premium Formula based on GigScore Tier.
 * 
 * Tiers:
 * 800+ (Elite) -> Rs. 19
 * 600-799 (Pro) -> Rs. 29
 * 400-599 (Standard) -> Rs. 39
 * < 400 (Risk) -> Rs. 49
 * 
 * 30% of premium goes to GigCorpus.
 * Validate that policy type is strictly INCOME_PROTECTION.
 */

function calculatePremium(gigScore, policyType = 'INCOME_PROTECTION') {
  // Business logic constraint: Strictly NO health or accident.
  const invalidTypes = ['HEALTH', 'LIFE', 'ACCIDENT', 'VEHICLE'];
  if (invalidTypes.includes(policyType.toUpperCase())) {
    throw new Error(`Policy type ${policyType} is strictly prohibited by platform constraints.`);
  }

  if (policyType !== 'INCOME_PROTECTION') {
    throw new Error('Only INCOME_PROTECTION policy type is allowed.');
  }

  let premium = 49; // Default highest rate for Risk tier

  if (gigScore >= 800) {
    premium = 19;
  } else if (gigScore >= 600) {
    premium = 29;
  } else if (gigScore >= 400) {
    premium = 39;
  }

  const corpusContribution = parseFloat((premium * 0.30).toFixed(2));

  return {
    base_premium: premium,
    corpus_contribution: corpusContribution
  };
}

module.exports = { calculatePremium };
