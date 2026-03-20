/**
 * Mock Notification Service (WhatsApp/SMS)
 */

const sendNotification = (phoneNumber, message) => {
    console.log(`[Notification] To: ${phoneNumber} | Content: ${message}`);
    // In a real production environment, this would call Twilio or Gupshup API
    return { success: true, timestamp: new Date() };
  };
  
  module.exports = { sendNotification };
