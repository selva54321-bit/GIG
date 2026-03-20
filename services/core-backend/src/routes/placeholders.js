const express = require('express');
const router = express.Router();

// Placeholder routes for Claims, GigScore, and Corpus
router.get('/claims', (req, res) => res.json({ message: 'List claims' }));
router.get('/gigscore', (req, res) => res.json({ current_score: 750, tier: 'Pro' }));
router.get('/corpus', (req, res) => res.json({ balance: 1240.50, projected_yield: 135.20 }));

module.exports = {
  claims: router,
  gigscore: router,
  corpus: router
};
