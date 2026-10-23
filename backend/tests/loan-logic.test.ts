import { describe, expect, it } from 'vitest';
import { isOverdue } from '../src/modules/loans/logic';

describe('overdue date policy', () => {
  it('only flags outstanding loans before the local calendar date', () => {
    expect(isOverdue('outstanding', '2026-10-22', '2026-10-23')).toBe(true);
    expect(isOverdue('outstanding', '2026-10-23', '2026-10-23')).toBe(false);
    expect(isOverdue('repaid', '2026-10-22', '2026-10-23')).toBe(false);
  });
});
