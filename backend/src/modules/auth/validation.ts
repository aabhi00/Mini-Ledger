import { z } from 'zod';

export function normalizePhone(value: string): string {
  const cleaned = value.trim().replace(/[\s()-]/g, '');
  if (!/^\+[1-9]\d{7,14}$/.test(cleaned)) throw new Error('Phone number must be in international format, e.g. +919876543210.');
  return cleaned;
}

export const requestOtpSchema = z.object({ phone: z.string().transform((value, context) => {
  try { return normalizePhone(value); }
  catch (error) { context.addIssue({ code: z.ZodIssueCode.custom, message: error instanceof Error ? error.message : 'Invalid phone number.' }); return z.NEVER; }
}) });

export const verifyOtpSchema = requestOtpSchema.extend({
  otp: z.string().regex(/^\d{6}$/, 'OTP must contain exactly six digits.'),
});
