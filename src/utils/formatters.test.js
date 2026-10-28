// Colombia (UTC-5) is where the date-only bug showed up
process.env.TZ = 'America/Bogota';

const { test } = await import('node:test');
const assert = (await import('node:assert/strict')).default;
const { daysUntil, formatCurrency, formatDate, parseLocalDate, setDisplayCurrency } = await import('./formatters.js');

const nbsp = (s) => s.replace(/ /g, ' ');

test('date-only strings are read as local dates, not UTC', () => {
  assert.equal(formatDate('2027-04-18'), '18 de abril de 2027');
  assert.deepEqual(parseLocalDate('2027-04-18'), new Date(2027, 3, 18));
  assert.equal(parseLocalDate('2026-10-19T17:00:00.000Z').getHours(), 12);
});

test('daysUntil counts calendar days', () => {
  const now = new Date(2026, 9, 19, 23, 30);
  assert.equal(daysUntil('2026-10-19', now), 0);
  assert.equal(daysUntil('2026-10-20', now), 1);
  assert.equal(daysUntil('2026-10-12', now), -7);
  assert.equal(daysUntil(new Date(2027, 3, 18, 12).toISOString(), now), 181);
});

test('formatCurrency follows the chosen currency and survives unknown codes', () => {
  setDisplayCurrency('COP');
  assert.equal(nbsp(formatCurrency(2650000)), '$ 2.650.000');
  setDisplayCurrency('USD');
  assert.equal(nbsp(formatCurrency(1200)), 'US$ 1.200');
  assert.equal(nbsp(formatCurrency(12.5)), 'US$ 12,50');
  setDisplayCurrency('NOPE');
  assert.equal(nbsp(formatCurrency(1000)), '$ 1.000');
});
