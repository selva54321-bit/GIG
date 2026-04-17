/**
 * Mock Firebase Authentication Middleware
 * Validates 'Authorization: Bearer <otp_token>'
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No authentication token provided.' });
  }

  // Accept both formats:
  // 1) Authorization: Bearer mock_worker_xxx
  // 2) Authorization: Bearer Bearer mock_worker_xxx (legacy client behavior)
  let token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (token.toLowerCase().startsWith('bearer ')) {
    token = token.slice(7).trim();
  }

  // For prototype/development: Any token containing 'mock_worker' is treated as valid
  if (token.includes('mock_worker')) {
    const suffix = token.split('mock_worker_')[1] || '';
    const digits = suffix.replace(/\D/g, '');
    const last10 = digits.slice(-10);

    req.user = {
      uid: `mock_uid_${last10 || 'default'}`,
      phone_number: last10.length === 10 ? `+91${last10}` : '+919876543210',
    };
    return next();
  }

  return res.status(403).json({ error: 'Forbidden', message: 'Invalid or expired token.' });
  };
  
  module.exports = authMiddleware;
