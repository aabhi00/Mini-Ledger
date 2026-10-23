import { describe, expect, it } from 'vitest';
import { validateReceipt } from '../src/modules/loans/receipts';

describe('receipt validation', () => {
  it('accepts supported, compact receipt images', () => expect(() => validateReceipt('image/jpeg', 1024)).not.toThrow());
  it('rejects unsupported types and oversized files', () => {
    expect(() => validateReceipt('application/pdf', 1024)).toThrow();
    expect(() => validateReceipt('image/png', 5 * 1024 * 1024 + 1)).toThrow();
  });
});
