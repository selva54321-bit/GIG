/**
 * Mock Firebase Authentication Middleware
 * Validates 'Authorization: Bearer <otp_token>'
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No authentication token provided.' });
    }
  
    const token = authHeader.split(' ')[1];
  
    // For Prototype/Development: Any token containing 'mock_worker' is treated as valid
    if (token.includes('mock_worker')) {
      // In a real app, we would verify with admin.auth().verifyIdToken(token)
      req.user = {
        uid: 'mock_uid_' + token.split('_')[2],
        phone_number: '+919876543210'
      };
      return next();
    }
  
    return res.status(403).json({ error: 'Forbidden', message: 'Invalid or expired token.' });
  };
  
  module.exports = authMiddleware;
