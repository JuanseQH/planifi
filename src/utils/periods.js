// Calendar periods for reports and budgets: week (Monday start), month, quarter, year. All in local time.
import { parseLocalDate } from './formatters.js';

export const PERIODS = ['week', 'month', 'quarter', 'year'];

const MONTHS_PER_PERIOD = { month: 1, quarter: 3, year: 12 };

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// Start (00:00) of the period that contains `date`
export const startOfPeriod = (date, period) => {
  const d = new Date(date);
  switch (period) {
    case 'week': {
      const daysSinceMonday = (d.getDay() + 6) % 7;
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysSinceMonday);
    }
    case 'quarter':
      return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
    case 'year':
      return new Date(d.getFullYear(), 0, 1);
    default:
      return new Date(d.getFullYear(), d.getMonth(), 1);
  }
};

// Move `date` by `n` periods, clamping the day so Mar 31 minus one month is Feb 28/29, not Mar 3
export const shiftPeriod = (date, period, n) => {
  const d = new Date(date);
  if (period === 'week') {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n * 7, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
  }
  const months = (MONTHS_PER_PERIOD[period] ?? 1) * n;
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
  target.setDate(Math.min(d.getDate(), daysInMonth(target.getFullYear(), target.getMonth())));
  return target;
};

// Current period, plus the previous period cut at the same elapsed point (Oct 1-19 vs Sep 1-19)
// so a half-finished month is never compared against a full one.
export const getComparisonRanges = (period, now = new Date()) => {
  const start = startOfPeriod(now, period);
  const end = startOfPeriod(shiftPeriod(start, period, 1), period);
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const previousStart = shiftPeriod(start, period, -1);
  const previousCut = shiftPeriod(startOfTomorrow, period, -1);
  const previousEnd = previousCut < start ? previousCut : start;
  return {
    current: { start, end },
    previous: { start: previousStart, end: previousEnd }
  };
};

// The last `count` whole periods ending with the current one, oldest first: [{ start, end }]
export const getTrendRanges = (period, count, now = new Date()) => {
  const currentStart = startOfPeriod(now, period);
  return Array.from({ length: count }, (_, i) => {
    const start = shiftPeriod(currentStart, period, i - (count - 1));
    return { start, end: shiftPeriod(start, period, 1) };
  });
};

export const inRange = (dateValue, { start, end }) => {
  const t = parseLocalDate(dateValue);
  return t >= start && t < end;
};

// The whole period (start of this one up to the start of the next) that contains `now`
export const currentPeriodRange = (period, now = new Date()) => {
  const start = startOfPeriod(now, period);
  return { start, end: shiftPeriod(start, period, 1) };
};

// Income and expenses (both positive) of the transactions dated inside [start, end)
export const sumInRange = (transactions, range) =>
  transactions.reduce(
    (totals, t) => {
      if (!inRange(t.date, range)) return totals;
      if (t.type === 'income') totals.income += Math.abs(t.amount);
      else if (t.type === 'expense') totals.expenses += Math.abs(t.amount);
      return totals;
    },
    { income: 0, expenses: 0 }
  );

export const expensesByCategory = (transactions, range) =>
  transactions.reduce((byCategory, t) => {
    if (t.type === 'expense' && inRange(t.date, range)) {
      byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount);
    }
    return byCategory;
  }, {});

// Percent change; null when there is nothing to compare against
export const percentChange = (current, previous) =>
  previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100;
