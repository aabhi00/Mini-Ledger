export function isOverdue(status: 'outstanding' | 'repaid', dueDate: string, today: string): boolean {
  return status === 'outstanding' && dueDate < today;
}
