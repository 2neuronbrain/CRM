import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isLocal = config.databaseUrl.includes('localhost') || config.databaseUrl.includes('127.0.0.1');

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: process.env.VERCEL ? 2 : 20,
  idleTimeoutMillis: process.env.VERCEL ? 5000 : 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error('[DB Query Error]', { text, error: err.message });
    throw err;
  }
}

export async function getClient() {
  return await pool.connect();
}

export async function initDb() {
  try {
    const tableCheck = await pool.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts'");
    if (tableCheck.rows.length > 0) {
      console.log('[DB] Database schema verified (accounts table exists).');
      return;
    }
  } catch (err) {
    console.warn('[DB] Pre-check query warning:', err.message);
  }

  console.log('[DB] Initializing database schema from schema.sql...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    try {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await pool.query(schemaSql);
      console.log('[DB] Database schema initialized successfully.');
    } catch (err) {
      console.error('[DB] Failed to initialize schema:', err.message);
      // Non-fatal if tables already partially exist
    }
  } else {
    console.warn('[DB] schema.sql not found on filesystem, relying on existing database migrations.');
  }
}

export default {
  query,
  getClient,
  initDb,
  pool
};
