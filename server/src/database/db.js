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
  max: process.env.VERCEL ? 5 : 20,
  idleTimeoutMillis: 30000,
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
  console.log('[DB] Initializing database schema...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    await pool.query(schemaSql);
    console.log('[DB] Database schema initialized successfully.');
  } catch (err) {
    console.error('[DB] Failed to initialize schema:', err.message);
    throw err;
  }
}

export default {
  query,
  getClient,
  initDb,
  pool
};
