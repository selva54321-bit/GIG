import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for Auth Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  verifyOTP: (phone, otp) => api.post('/auth/verify', { phone_number: phone, otp })
};

export const policyService = {
  getPremium: (gigScore) => api.post('/policy/purchase', { gigScore, type: 'INCOME_PROTECTION' }),
  activePolicy: () => api.get('/policy/active')
};

export const claimService = {
  getClaims: () => api.get('/claims')
};

export const gigScoreService = {
  getCurrent: () => api.get('/gigscore')
};

export const corpusService = {
  getStats: () => api.get('/corpus')
};

export const adminService = {
  getAnalyticsSummary: () => api.get('/admin/analytics/summary'),
  getFraudQueue: () => api.get('/admin/fraud-queue'),
  getLiveTriggers: () => api.get('/admin/triggers/live'),
  getCorpusSummary: () => api.get('/admin/corpus/summary')
};

export default api;
