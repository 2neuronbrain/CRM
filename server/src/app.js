import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import db from './database/db.js';
import apiRouter from './routes/api.js';
import syncWorker from './sync/worker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../../client/dist');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Serve React Client build in production
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[App Error]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

async function startServer() {
  try {
    console.log('[App] Initializing database...');
    await db.initDb();

    const server = app.listen(config.port, () => {
      console.log(`[App] CRM Backend server running on http://localhost:${config.port}`);
    });

    console.log('[App] Starting Background Synchronization Worker...');
    await syncWorker.init();

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[App] SIGTERM received. Shutting down gracefully...');
      syncWorker.stop();
      server.close(() => {
        db.pool.end();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('[App] SIGINT received. Shutting down gracefully...');
      syncWorker.stop();
      server.close(() => {
        db.pool.end();
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('[App] Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
