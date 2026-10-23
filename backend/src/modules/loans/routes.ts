import { Router } from 'express';
import { query } from '../../db/pool';
import { ApiError } from '../../errors';
import { type AuthenticatedRequest, requireAuth } from '../../middleware/auth';
import { loanIdSchema, loanSchema } from './validation';
import { isOverdue } from './logic';

type LoanRow = { id: string; friend_name: string; amount: string; due_date: string; status: 'outstanding' | 'repaid'; created_at: Date; repaid_at: Date | null };
const selectLoan = `SELECT id, friend_name, amount::text, due_date::text, status, created_at, repaid_at FROM loans`;
const returningLoan = 'RETURNING id, friend_name, amount::text, due_date::text, status, created_at, repaid_at';
function loanResponse(row: LoanRow) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  return { id: row.id, friendName: row.friend_name, amount: row.amount, dueDate: row.due_date, status: row.status, createdAt: row.created_at.toISOString(), repaidAt: row.repaid_at?.toISOString() ?? null, isOverdue: isOverdue(row.status, row.due_date, today) };
}

const router = Router();
router.use(requireAuth);

router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { friendName, amount, dueDate } = loanSchema.parse(req.body);
    const result = await query<LoanRow>(`INSERT INTO loans (user_id, friend_name, amount, due_date) VALUES ($1, $2, $3, $4) ${returningLoan}`, [req.userId, friendName, amount, dueDate]);
    res.status(201).json({ loan: loanResponse(result.rows[0]) });
  } catch (error) { next(error); }
});

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await query<LoanRow>(`${selectLoan} WHERE user_id = $1 ORDER BY CASE WHEN status = 'outstanding' THEN 0 ELSE 1 END, due_date ASC, created_at DESC`, [req.userId]);
    res.json({ loans: result.rows.map(loanResponse) });
  } catch (error) { next(error); }
});

router.patch('/:id/repay', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = loanIdSchema.parse(req.params.id);
    const result = await query<LoanRow>(`UPDATE loans SET status = 'repaid', repaid_at = NOW() WHERE id = $1 AND user_id = $2 AND status = 'outstanding' ${returningLoan}`, [id, req.userId]);
    if (result.rowCount) return res.json({ loan: loanResponse(result.rows[0]) });
    const exists = await query<{ status: string }>('SELECT status FROM loans WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (exists.rowCount && exists.rows[0].status === 'repaid') throw new ApiError(409, 'ALREADY_REPAID', 'This loan has already been repaid.');
    throw new ApiError(404, 'NOT_FOUND', 'Loan not found.');
  } catch (error) { next(error); }
});

export default router;
