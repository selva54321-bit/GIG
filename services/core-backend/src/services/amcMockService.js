/**
 * Mock Asset Management Company (AMC) Service
 * Simulates a targeted 7.2% p.a. return across a diversified debt portfolio.
 */

const PORTFOLIO_WEIGHTS = {
    G_SEC: 0.40,      // 40% Govt Securities
    RBI_BONDS: 0.25,  // 25% RBI Bonds
    LIQUID_FUNDS: 0.20,
    DEBT_FUNDS: 0.10,
    CASH: 0.05
  };
  
  const ANNUAL_RETURN_RATE = 0.072; // 7.2%
  const MGMT_FEE_RATE = 0.015;     // 1.5% fixed fee at maturity
  
  /**
   * Calculate compounding for a period
   * @param {number} principal 
   * @param {number} days 
   */
  const calculateGrowth = (principal, days) => {
    // Daily compounding formula: A = P(1 + r/n)^(nt)
    // Simplified for daily: principal * (1 + (annual_rate / 365))^days
    const dailyRate = ANNUAL_RETURN_RATE / 365;
    const finalAmount = principal * Math.pow((1 + dailyRate), days);
    return parseFloat((finalAmount - principal).toFixed(2));
  };
  
  module.exports = { 
    calculateGrowth, 
    ANNUAL_RETURN_RATE, 
    MGMT_FEE_RATE,
    PORTFOLIO_WEIGHTS 
  };
