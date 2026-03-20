/**
 * Mock External APIs for Parametric Triggers
 * Simulates response from Weather, AQI, and Government agencies.
 */

const getWeatherData = (zone) => {
    // Mocking high rain for 'Mumbai_Andheri' to test the trigger
    if (zone === 'Mumbai_Andheri') {
      return { rain_mm: 75.2, temperature: 31 }; // Threshold > 64.5mm
    }
    return { rain_mm: 10.5, temperature: 28 };
  };
  
  const getAQIData = (zone) => {
    // Mocking high AQI for 'Delhi_NCR'
    if (zone === 'Delhi_NCR') {
      return { aqi: 450 }; // Threshold > 400
    }
    return { aqi: 120 };
  };
  
  const getGovtAlerts = (zone) => {
    // Mocking Flood for 'Chennai_Tnagar'
    if (zone === 'Chennai_Tnagar') {
      return { alerts: ['FLOOD_WARNING', 'MOVEMENT_RESTRICTED'] };
    }
    return { alerts: [] };
  };
  
  module.exports = { getWeatherData, getAQIData, getGovtAlerts };
