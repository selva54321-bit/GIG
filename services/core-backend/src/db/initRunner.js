require('dotenv').config();
const { initializeDatabase } = require('./init');

(async () => {
  const result = await initializeDatabase();

  if (result.reason === 'db-unavailable') {
    process.exitCode = 1;
    return;
  }

  process.exitCode = 0;
})();
