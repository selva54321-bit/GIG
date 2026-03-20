const express = require('express');
const router = express.Router();

/**
 * @route POST /api/auth/verify
 * @desc Verify OTP and return mock Firebase token
 */
router.post('/verify', (req, res) => {
  const { phone_number, otp } = req.body;
  
  if (otp === '123456') {
    return res.status(200).json({
      success: true,
      token: `Bearer mock_worker_${phone_number.slice(-4)}`,
      user: { phone_number, platform: 'Zepto' }
    });
  }
  
  res.status(400).json({ success: false, message: 'Invalid OTP' });
});

module.exports = router;
