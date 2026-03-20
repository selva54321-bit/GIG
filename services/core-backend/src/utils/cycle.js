/**
 * Utility to determine the current Mon-Sun weekly window.
 * Returns start_date (Monday 00:00:00) and end_date (Sunday 23:59:59)
 */
function calculateWeeklyCycle(referenceDate = new Date()) {
  const current = new Date(referenceDate);
  
  // JavaScript getDay() returns 0 for Sunday, 1 for Monday, etc.
  const dayOfWeek = current.getDay();
  
  // Calculate days to subtract to get to Monday. If Sunday (0), subtract 6. Otherwise, subtract dayOfWeek - 1.
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const startOfCycle = new Date(current);
  startOfCycle.setDate(current.getDate() - daysToMonday);
  startOfCycle.setHours(0, 0, 0, 0);

  const endOfCycle = new Date(startOfCycle);
  endOfCycle.setDate(startOfCycle.getDate() + 6);
  endOfCycle.setHours(23, 59, 59, 999);

  return {
    start_date: startOfCycle,
    end_date: endOfCycle
  };
}

module.exports = { calculateWeeklyCycle };
