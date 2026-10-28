// Run with: npm test (Node's built-in test runner, no extra dependencies)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  startOfPeriod,
  shiftPeriod,
  getComparisonRanges,
  getTrendRanges,
  sumInRange,
  expensesByCategory,
  percentChange
} from './periods.js';

const day = (y, m, d, h = 0) => new Date(y, m - 1, d, h);

test('startOfPeriod: weeks start on Monday, quarters on Jan/Apr/Jul/Oct', () => {
  assert.deepEqual(startOfPeriod(day(2026, 10, 19, 15), 'week'), day(2026, 10, 19)); // Monday
  assert.deepEqual(startOfPeriod(day(2026, 10, 25, 9), 'week'), day(2026, 10, 19)); // Sunday
  assert.deepEqual(startOfPeriod(day(2026, 10, 19), 'month'), day(2026, 10, 1));
  assert.deepEqual(startOfPeriod(day(2026, 11, 30), 'quarter'), day(2026, 10, 1));
  assert.deepEqual(startOfPeriod(day(2026, 2, 3), 'year'), day(2026, 1, 1));
});

test('shiftPeriod clamps month-end days instead of overflowing', () => {
  assert.deepEqual(shiftPeriod(day(2026, 3, 31), 'month', -1), day(2026, 2, 28));
  assert.deepEqual(shiftPeriod(day(2024, 3, 31), 'month', -1), day(2024, 2, 29));
  assert.deepEqual(shiftPeriod(day(2026, 1, 15), 'quarter', -1), day(2025, 10, 15));
  assert.deepEqual(shiftPeriod(day(2026, 1, 5), 'week', -1), day(2025, 12, 29));
});

test('getComparisonRanges compares the same elapsed days of the previous period', () => {
  const { current, previous } = getComparisonRanges('month', day(2026, 10, 19, 9));
  assert.deepEqual(current, { start: day(2026, 10, 1), end: day(2026, 11, 1) });
  assert.deepEqual(previous, { start: day(2026, 9, 1), end: day(2026, 9, 20) });

  // On Mar 31 the cut is the end of February, never past the current start
  const endOfMarch = getComparisonRanges('month', day(2026, 3, 31, 12));
  assert.deepEqual(endOfMarch.previous, { start: day(2026, 2, 1), end: day(2026, 3, 1) });
});

test('getTrendRanges returns consecutive periods, oldest first', () => {
  const ranges = getTrendRanges('month', 3, day(2026, 1, 10));
  assert.deepEqual(ranges.map((r) => r.start), [day(2025, 11, 1), day(2025, 12, 1), day(2026, 1, 1)]);
  assert.deepEqual(ranges[2].end, day(2026, 2, 1));
});

test('sumInRange and expensesByCategory only count transactions inside [start, end)', () => {
  const txs = [
    { type: 'income', amount: 1000, category: 'Trabajo', date: day(2026, 10, 5).toISOString() },
    { type: 'expense', amount: -300, category: 'Alimentación', date: day(2026, 10, 19, 12).toISOString() },
    { type: 'expense', amount: -50, category: 'Alimentación', date: day(2026, 10, 2).toISOString() },
    { type: 'expense', amount: -999, category: 'Transporte', date: day(2026, 9, 30).toISOString() },
    { type: 'expense', amount: -1, category: 'Transporte', date: day(2026, 11, 1).toISOString() }
  ];
  const october = { start: day(2026, 10, 1), end: day(2026, 11, 1) };
  assert.deepEqual(sumInRange(txs, october), { income: 1000, expenses: 350 });
  assert.deepEqual(expensesByCategory(txs, october), { Alimentación: 350 });
});

test('percentChange handles growth, drops and missing baselines', () => {
  assert.equal(percentChange(120, 100), 20);
  assert.equal(percentChange(50, 100), -50);
  assert.equal(percentChange(-50, -100), 50); // a smaller deficit is an improvement
  assert.equal(percentChange(100, 0), null);
});
