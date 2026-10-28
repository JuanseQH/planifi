import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBudgetSpent, withSpent } from './budget.js';

const now = new Date(2026, 9, 19, 15); // Mon Oct 19 2026
const tx = (amount, category, date, type = 'expense') => ({ amount: -Math.abs(amount), type, category, date });

const transactions = [
  tx(150000, 'Alimentación', new Date(2026, 9, 19, 12).toISOString()), // this week + month
  tx(50000, 'Alimentación', '2026-10-02'), // this month, earlier week
  tx(70000, 'Alimentación', '2026-09-28'), // last month: must not count (monthly reset)
  tx(30000, 'Transporte', '2026-10-05'), // other category
  { amount: 900000, type: 'income', category: 'Alimentación', date: '2026-10-03' } // income never counts
];

test('monthly budget only counts this month\'s expenses of its category', () => {
  assert.equal(getBudgetSpent({ category: 'Alimentación', period: 'month' }, transactions, now), 200000);
});

test('weekly and yearly budgets use their own period', () => {
  assert.equal(getBudgetSpent({ category: 'Alimentación', period: 'week' }, transactions, now), 150000);
  assert.equal(getBudgetSpent({ category: 'Alimentación', period: 'year' }, transactions, now), 270000);
});

test('deleting a transaction lowers spent; a new budget includes earlier expenses', () => {
  const afterDelete = transactions.slice(1);
  assert.equal(getBudgetSpent({ category: 'Alimentación', period: 'month' }, afterDelete, now), 50000);
  const [fresh] = withSpent([{ category: 'Transporte', period: 'month', spent: 0 }], transactions, now);
  assert.equal(fresh.spent, 30000);
});
