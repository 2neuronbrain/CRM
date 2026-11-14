import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mcpUrl: process.env.MCP_URL || 'https://questathon.aihackerscollective.com/api/public/mcp',
  aqToken: process.env.AQ_TOKEN || '',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/crm',
  rateLimitIntervalMs: parseInt(process.env.RATE_LIMIT_INTERVAL_MS || '65000', 10),
  clientOrigin: process.env.CLIENT_ORIGIN || '*'
};

if (!config.aqToken) {
  console.warn('[Config] WARNING: AQ_TOKEN is not set in environment variables.');
}
