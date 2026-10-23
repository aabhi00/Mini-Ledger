import { z } from 'zod';

const amountPattern = /^\d+(?:\.\d{1,2})?$/;
export const loanSchema = z.object({
  friendName: z.string().trim().min(1, 'Friend name is required.').max(100, 'Friend name must be 100 characters or fewer.'),
  amount: z.union([z.number(), z.string()]).transform((value, context) => {
    const text = String(value).trim();
    if (!amountPattern.test(text) || !Number.isFinite(Number(text)) || Number(text) <= 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Amount must be a positive number with at most two decimal places.' });
      return z.NEVER;
    }
    return text;
  }),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must use YYYY-MM-DD.').refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Due date must be a valid calendar date.'),
});

export const loanIdSchema = z.string().uuid('Loan ID must be a valid UUID.');
