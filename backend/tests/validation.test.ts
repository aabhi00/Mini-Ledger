import { describe, expect, it } from 'vitest';
import { normalizePhone, verifyOtpSchema } from '../src/modules/auth/validation';
import { loanIdSchema, loanSchema } from '../src/modules/loans/validation';

describe('input validation', () => {
  it('normalizes a valid phone number', () => expect(normalizePhone(' +91 98765-43210 ')).toBe('+919876543210'));
  it('rejects an invalid phone or OTP', () => {
    expect(() => normalizePhone('1234')).toThrow();
    expect(() => verifyOtpSchema.parse({ phone: '+919876543210', otp: '12345' })).toThrow();
  });
  it('accepts a valid loan and rejects unsafe loan fields', () => {
    expect(loanSchema.parse({ friendName: ' Aman ', amount: '1500.50', dueDate: '2026-10-23' })).toMatchObject({ friendName: 'Aman' });
    expect(() => loanSchema.parse({ friendName: ' ', amount: '0', dueDate: '2026-02-30' })).toThrow();
    expect(() => loanIdSchema.parse('not-a-uuid')).toThrow();
  });
});
