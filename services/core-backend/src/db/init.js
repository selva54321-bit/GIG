const fs = require('fs');
const path = require('path');
const { query } = require('./client');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const SCHEMA_SQL = path.join(ROOT_DIR, 'database', 'schema.sql');
const MIGRATION_SQL = path.join(ROOT_DIR, 'database', 'migration_gigcorpus.sql');
const SEED_SQL = path.join(ROOT_DIR, 'database', 'seed.sql');

function isTrue(value, defaultValue = false) {
  if (value === undefined || value === null) return defaultValue;
  return String(value).toLowerCase() === 'true';
}

async function tableExists(tableName) {
  const result = await query('SELECT to_regclass($1) AS table_ref', [`public.${tableName}`]);
  return Boolean(result.rows[0]?.table_ref);
}

async function columnExists(tableName, columnName) {
  const result = await query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
     LIMIT 1`,
    [tableName, columnName]
  );

  return result.rows.length > 0;
}

async function executeSqlFile(filePath, label) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await query(sql);
  console.log(`[DB Init] ${label} executed.`);
}

async function applyMigrationSafely() {
  const hasLedger = await tableExists('gigcorpusledger');
  if (!hasLedger) {
    return;
  }

  const hasAccumulatedReturns = await columnExists('gigcorpusledger', 'accumulated_returns');
  const hasCompoundingLastRun = await columnExists('gigcorpusledger', 'compounding_last_run');
  const hasStatus = await columnExists('gigcorpusledger', 'status');

  if (hasAccumulatedReturns && hasCompoundingLastRun && hasStatus) {
    return;
  }

  await executeSqlFile(MIGRATION_SQL, 'GigCorpus migration');
}

async function applySeedIfNeeded() {
  const shouldSeed = isTrue(process.env.AUTO_DB_SEED, true);
  if (!shouldSeed) {
    return;
  }

  const usersCountResult = await query('SELECT COUNT(*)::int AS count FROM users');
  const currentCount = Number(usersCountResult.rows[0]?.count || 0);

  if (currentCount > 0) {
    return;
  }

  await executeSqlFile(SEED_SQL, 'Seed data');
}

async function initializeDatabase() {
  const shouldInit = isTrue(process.env.AUTO_DB_INIT, true);
  if (!shouldInit) {
    console.log('[DB Init] Skipped (AUTO_DB_INIT=false).');
    return { initialized: false, skipped: true, reason: 'disabled' };
  }

  try {
    await query('SELECT 1');

    // Needed for gen_random_uuid() used in schema defaults.
    await query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    const hasUsersTable = await tableExists('users');
    if (!hasUsersTable) {
      await executeSqlFile(SCHEMA_SQL, 'Base schema');
    }

    await applyMigrationSafely();
    await applySeedIfNeeded();

    console.log('[DB Init] Database initialization completed.');
    return { initialized: true, skipped: false };
  } catch (error) {
    console.warn('[DB Init] Database unavailable, continuing in fallback mode:', error.message);
    return { initialized: false, skipped: false, reason: 'db-unavailable', error: error.message };
  }
}

module.exports = {
  initializeDatabase,
};
