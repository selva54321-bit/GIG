const { Pool } = require('pg');

const DB_URL = process.env.DB_URL || 'postgres://user:pass@localhost:5432/gigshield';

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: DB_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });
  }

  return pool;
}

async function query(text, params = []) {
  const client = getPool();
  return client.query(text, params);
}

module.exports = {
  query,
};
