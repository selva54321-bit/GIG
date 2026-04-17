const express = require('express');
const router = express.Router();

function normalizePhone(input) {
  return String(input || '').trim();
}

function isValidOtp(otp) {
  return otp === '123456' || otp === '1111';
}

function buildVerifyPayload(phoneNumber) {
  const tokenValue = `mock_worker_${phoneNumber.replace(/\D/g, '').slice(-10)}`;

  return {
    success: true,
    message: 'OTP verified successfully.',
    token: tokenValue,
    token_type: 'Bearer',
    user: {
      phone_number: phoneNumber,
      platform: 'Zepto',
    },
  };
}

/**
 * @route POST /api/auth/verify
 * @desc Verify OTP and return mock Firebase token
 */
function verifyOtpHandler(req, res) {
  const { phone_number, phone, otp } = req.body;
  const normalizedPhone = normalizePhone(phone_number || phone);

  if (!normalizedPhone) {
    return res.status(400).json({ success: false, message: 'phone_number is required.' });
  }

  if (isValidOtp(otp)) {
    return res.status(200).json(buildVerifyPayload(normalizedPhone));
  }

  return res.status(400).json({ success: false, message: 'Invalid OTP' });
}

router.post('/verify', verifyOtpHandler);

// Backward-compatible alias for clients that use /verify-otp.
router.post('/verify-otp', verifyOtpHandler);

// Mock login endpoint for flows that separate OTP send and verify.
router.post('/login', (req, res) => {
  const { phone_number, phone } = req.body;
  const normalizedPhone = normalizePhone(phone_number || phone);

  if (!normalizedPhone) {
    return res.status(400).json({ success: false, message: 'phone_number is required.' });
  }

  return res.status(200).json({
    success: true,
    message: 'OTP sent successfully (mock). Use 1111 or 123456 for demo.',
    phone_number: normalizedPhone,
  });
});

module.exports = router;
