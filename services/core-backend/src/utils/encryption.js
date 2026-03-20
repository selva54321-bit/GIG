const crypto = require('crypto');

/**
 * AES-256-GCM Encryption Utility for PII (UPI/Bank Details)
 * Compliant with financial data storage standards for the hackathon.
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'very_secret_key_32_characters_long_123';
const ALGORITHM = 'aes-256-gcm';

const encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    content: encrypted,
    iv: iv.toString('hex'),
    tag: authTag
  };
};

const decrypt = (encrypted) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY), 
    Buffer.from(encrypted.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));
  
  let decrypted = decipher.update(encrypted.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

module.exports = { encrypt, decrypt };
