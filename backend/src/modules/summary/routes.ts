import { Router } from 'express';
import { query } from '../../db/pool';
import { type AuthenticatedRequest, requireAuth } from '../../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await query<{ total_lent: string; total_repaid: string; overdue_amount: string }>(
      `SELECT COALESCE(SUM(amount), 0)::text AS total_lent,
        COALESCE(SUM(amount) FILTER (WHERE status = 'repaid'), 0)::text AS total_repaid,
        COALESCE(SUM(amount) FILTER (WHERE status = 'outstanding' AND due_date < CURRENT_DATE), 0)::text AS overdue_amount
       FROM loans WHERE user_id = $1`, [req.userId],
    );
    const summary = result.rows[0];
    res.json({ totalLent: summary.total_lent, totalRepaid: summary.total_repaid, overdueAmount: summary.overdue_amount, currency: 'INR' });
  } catch (error) { next(error); }
});
export default router;
