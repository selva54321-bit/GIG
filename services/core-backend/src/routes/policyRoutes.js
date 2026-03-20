const express = require('express');
const router = express.Router();
const { calculatePremium } = require('../utils/premium');
const { calculateWeeklyCycle } = require('../utils/cycle');

/**
 * @route POST /api/policy/purchase
 * @desc Purchase a new weekly income protection policy
 */
router.post('/purchase', (req, res) => {
  const { gigScore, type } = req.body;
  
  try {
    const pricing = calculatePremium(gigScore, type);
    const cycle = calculateWeeklyCycle();
    
    res.status(201).json({
      success: true,
      policy: {
        type: 'INCOME_PROTECTION',
        premium: pricing.base_premium,
        corpus_contribution: pricing.corpus_contribution,
        starts: cycle.start_date,
        ends: cycle.end_date,
        status: 'ACTIVE'
      }
    });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

router.get('/active', (req, res) => {
    res.json({ message: 'List active policies for authenticated worker' });
});

module.exports = router;
