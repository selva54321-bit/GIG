const cron = require('node-cron');
const { getWeatherData, getAQIData, getGovtAlerts } = require('./mockApis');
const { processAutoClaim } = require('./claimService');

/**
 * Trigger Monitor Service
 * Evaluates external data against thresholds every 15 minutes.
 */

// Active zones to monitor (In production, these would come from the Users/Zones table)
const ZONES_TO_MONITOR = ['Mumbai_Andheri', 'Delhi_NCR', 'Chennai_Tnagar', 'Bangalore_Indiranagar'];

const processZoneTriggers = async (zone) => {
  // 1. Weather Checks (Rain > 64.5mm or Heat > 45C)
  const weather = getWeatherData(zone);
  if (weather.rain_mm > 64.5) {
    await processAutoClaim(zone, 'RAIN');
  }

  if (weather.temperature > 45) {
    await processAutoClaim(zone, 'HEAT');
  }

  // 2. AQI Checks (AQI > 400)
  const aqiData = getAQIData(zone);
  if (aqiData.aqi > 400) {
    await processAutoClaim(zone, 'AQI');
  }

  // 3. Govt Alerts (Flood/Curfew)
  const govt = getGovtAlerts(zone);
  if (govt.alerts.includes('FLOOD_WARNING')) {
    await processAutoClaim(zone, 'FLOOD');
  }

  if (govt.alerts.includes('MOVEMENT_RESTRICTED')) {
    await processAutoClaim(zone, 'CURFEW');
  }
};

const monitorTriggers = async () => {
  console.log(`[TriggerMonitor] Cycle started at ${new Date().toISOString()}`);

  for (const zone of ZONES_TO_MONITOR) {
    try {
      await processZoneTriggers(zone);
    } catch (error) {
      console.error(`[TriggerMonitor] Zone processing failed for ${zone}:`, error.message);
    }
  }

  console.log('[TriggerMonitor] Cycle completed.');
};

// Schedule Cron: Every 15 minutes
// '*/15 * * * *'
const startTriggerMonitor = () => {
    // For prototype demonstration, trigger one cycle at startup.
    monitorTriggers().catch((error) => {
      console.error('[TriggerMonitor] Initial run failed:', error.message);
    });

    cron.schedule('*/15 * * * *', () => {
        monitorTriggers().catch((error) => {
          console.error('[TriggerMonitor] Scheduled run failed:', error.message);
        });
    });
    console.log('[TriggerMonitor] Cron job scheduled for every 15 minutes.');
};

module.exports = { startTriggerMonitor };
