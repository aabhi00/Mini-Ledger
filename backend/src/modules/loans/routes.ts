import { Router } from 'express';
import { query } from '../../db/pool';
import { ApiError } from '../../errors';
import { type AuthenticatedRequest, requireAuth } from '../../middleware/auth';
import { loanIdSchema, loanSchema } from './validation';
import { isOverdue } from './logic';
import { receiptUpload, uploadsDirectory, validateReceipt } from './receipts';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

type LoanRow = { id: string; friend_name: string; amount: string; due_date: string; status: 'outstanding' | 'repaid'; created_at: Date; repaid_at: Date | null; receipt_file_name: string | null; receipt_mime_type: string | null };
const loanColumns = 'id, friend_name, amount::text, due_date::text, status, created_at, repaid_at, receipt_file_name, receipt_mime_type';
const selectLoan = `SELECT ${loanColumns} FROM loans`;
const returningLoan = `RETURNING ${loanColumns}`;
function loanResponse(row: LoanRow) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  return { id: row.id, friendName: row.friend_name, amount: row.amount, dueDate: row.due_date, status: row.status, createdAt: row.created_at.toISOString(), repaidAt: row.repaid_at?.toISOString() ?? null, isOverdue: isOverdue(row.status, row.due_date, today), hasReceipt: Boolean(row.receipt_file_name) };
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

router.post('/:id/receipt', receiptUpload.single('receipt'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = loanIdSchema.parse(req.params.id);
    if (!req.file) throw new ApiError(400, 'INVALID_RECEIPT', 'Attach one JPEG, PNG, or WebP receipt image.');
    validateReceipt(req.file.mimetype, req.file.size);
    const previous = await query<{ receipt_file_name: string | null }>('SELECT receipt_file_name FROM loans WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (!previous.rowCount) { await unlink(req.file.path).catch(() => undefined); throw new ApiError(404, 'NOT_FOUND', 'Loan not found.'); }
    const updated = await query<LoanRow>(`UPDATE loans SET receipt_file_name = $1, receipt_mime_type = $2 WHERE id = $3 AND user_id = $4 ${returningLoan}`, [req.file.filename, req.file.mimetype, id, req.userId]);
    if (previous.rows[0].receipt_file_name) await unlink(resolve(uploadsDirectory, previous.rows[0].receipt_file_name)).catch(() => undefined);
    res.json({ loan: loanResponse(updated.rows[0]) });
  } catch (error) { next(error); }
});

router.get('/:id/receipt', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = loanIdSchema.parse(req.params.id);
    const result = await query<{ receipt_file_name: string | null; receipt_mime_type: string | null }>('SELECT receipt_file_name, receipt_mime_type FROM loans WHERE id = $1 AND user_id = $2', [id, req.userId]);
    const receipt = result.rows[0];
    if (!receipt?.receipt_file_name) throw new ApiError(404, 'NOT_FOUND', 'Receipt not found.');
    res.type(receipt.receipt_mime_type ?? 'application/octet-stream').sendFile(resolve(uploadsDirectory, receipt.receipt_file_name));
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
