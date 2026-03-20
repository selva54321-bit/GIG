const axios = require('axios');

/**
 * Client to communicate with the Python ML Microservice
 */
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const getPremiumAdjustment = async (features) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/premium`, features);
    return response.data.adjustment;
  } catch (error) {
    console.error('ML Service Error (Premium):', error.message);
    return 0; // Default to no adjustment
  }
};

const detectFraudRisk = async (claimData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/detect/fraud`, claimData);
    return response.data; // { fraud_risk_score, decision }
  } catch (error) {
    console.error('ML Service Error (Fraud):', error.message);
    return { fraud_risk_score: 0, decision: 'REVIEW' };
  }
};

const updateGigScore = async (currentScore, events) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/calculate/gigscore`, {
      current_score: currentScore,
      events: events
    });
    return response.data.updated_score;
  } catch (error) {
    console.error('ML Service Error (GigScore):', error.message);
    return currentScore;
  }
};

module.exports = {
  getPremiumAdjustment,
  detectFraudRisk,
  updateGigScore
};
