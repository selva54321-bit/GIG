const express = require('express');
const router = express.Router();

/**
 * @route POST /api/auth/verify
 * @desc Verify OTP and return mock Firebase token
 */
router.post('/verify', (req, res) => {
  const { phone_number, otp } = req.body;
  const normalizedPhone = String(phone_number || '').trim();

  if (!normalizedPhone) {
    return res.status(400).json({ success: false, message: 'phone_number is required.' });
  }

  if (otp === '123456') {
    const tokenValue = `mock_worker_${normalizedPhone.replace(/\D/g, '').slice(-10)}`;

    return res.status(200).json({
      success: true,
      token: tokenValue,
      token_type: 'Bearer',
      user: { phone_number: normalizedPhone, platform: 'Zepto' }
    });
  }
  
  res.status(400).json({ success: false, message: 'Invalid OTP' });
});

module.exports = router;
