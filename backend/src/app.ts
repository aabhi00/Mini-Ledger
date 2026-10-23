import express from 'express';
import { query } from './db/pool';
import { errorHandler, notFound } from './errors';

export const app = express();
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (_req, res, next) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) { next(error); }
});

app.use(notFound);
app.use(errorHandler);
