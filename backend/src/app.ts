import express from 'express';
import { query } from './db/pool';
import { errorHandler, notFound } from './errors';
import authRoutes from './modules/auth/routes';
import loanRoutes from './modules/loans/routes';
import summaryRoutes from './modules/summary/routes';

export const app = express();
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (_req, res, next) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) { next(error); }
});
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/summary', summaryRoutes);

app.use(notFound);
app.use(errorHandler);
