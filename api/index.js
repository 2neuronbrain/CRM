import express from 'express';
import cors from 'cors';
import db from '../server/src/database/db.js';
import apiRouter from '../server/src/routes/api.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Lazy DB initialization for serverless execution
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await db.initDb();
      dbInitialized = true;
    } catch (err) {
      console.warn('[Vercel Serverless] DB init check warning:', err.message);
    }
  }
  next();
});

// Support both /api/path and direct path in serverless function
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
