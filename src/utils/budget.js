import { currentPeriodRange, inRange } from './periods.js';

// Budget health shared by Dashboard and Budget: same thresholds, same words, same tone.
export const getBudgetStatus = (percentage) => {
  if (percentage >= 100) return { label: 'Te pasaste', tone: 'tone-expense' };
  if (percentage >= 90) return { label: 'Casi al tope', tone: 'tone-expense' };
  if (percentage >= 75) return { label: 'Ojo', tone: 'tone-warn' };
  return { label: 'Vas bien', tone: 'tone-income' };
};

export const getBudgetPercentage = (budget) => (budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0);

// Spent is derived from the transactions, never stored: it resets every period, drops when a
// transaction is deleted, and counts expenses made before the budget was created.
export const getBudgetSpent = (budget, transactions, now = new Date()) => {
  const range = currentPeriodRange(budget.period || 'month', now);
  return transactions.reduce(
    (sum, t) =>
      t.type === 'expense' && t.category === budget.category && inRange(t.date, range)
        ? sum + Math.abs(t.amount)
        : sum,
    0
  );
};

export const withSpent = (budgets, transactions, now = new Date()) =>
  budgets.map((budget) => ({ ...budget, spent: getBudgetSpent(budget, transactions, now) }));
