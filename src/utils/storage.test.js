import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadState, normalizeState, STORAGE_KEY } from './storage.js';

const defaults = {
  user: { name: 'Usuario', email: 'u@e.com', currency: 'COP', language: 'es' },
  transactions: [{ id: 1, title: 'Seed', amount: 1, type: 'income', category: 'Trabajo', date: '2026-10-01' }],
  budgets: [],
  goals: [],
  categories: [{ name: 'Trabajo', type: 'income' }]
};

const memoryStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    }
  };
};

test('strict import rejects anything that is not a Planifi backup', () => {
  assert.equal(normalizeState({}, defaults, { strict: true }), null);
  assert.equal(normalizeState([], defaults, { strict: true }), null);
  assert.equal(normalizeState('hola', defaults, { strict: true }), null);
  assert.equal(normalizeState({ transactions: [], budgets: [] }, defaults, { strict: true }), null);
});

test('drops invalid items and fills missing fields', () => {
  const state = normalizeState(
    {
      user: { name: 'Ana', currency: 42 },
      transactions: [
        { id: 7, title: 'Mercado', amount: '-15000', type: 'expense', category: 'Alimentación', date: '2026-10-02' },
        { amount: 10, type: 'income', date: '2026-10-03' }, // no title/description/category
        { amount: 'abc', type: 'expense', date: '2026-10-03' },
        { amount: 5, type: 'gift', date: '2026-10-03' },
        { amount: 5, type: 'income', date: 'not a date' }
      ],
      budgets: [{ category: 'Transporte', limit: 100, period: 'fortnight' }, { limit: 5 }],
      goals: [{ title: 'Viaje', target: 1000, deadline: '2027-04-18' }, { title: 'Sin meta', target: 0, deadline: '2027-01-01' }]
    },
    defaults,
    { strict: true }
  );

  assert.equal(state.user.name, 'Ana');
  assert.equal(state.user.currency, 'COP'); // non-string ignored
  assert.equal(state.transactions.length, 2);
  assert.equal(state.transactions[0].amount, -15000);
  assert.equal(state.transactions[0].description, '');
  assert.equal(state.transactions[1].title, 'Sin título');
  assert.equal(state.transactions[1].category, 'Otros');
  assert.deepEqual(state.budgets.map((b) => b.period), ['month']);
  assert.equal(state.goals.length, 1);
  assert.equal(state.goals[0].saved, 0);
  assert.equal(state.goals[0].priority, 'medium');
  assert.deepEqual(state.categories, defaults.categories);
});

test('loadState never throws and keeps unreadable data aside', () => {
  assert.equal(loadState(defaults, memoryStorage()), defaults);

  const corrupt = memoryStorage({ [STORAGE_KEY]: '{not json' });
  assert.equal(loadState(defaults, corrupt), defaults);
  assert.equal(corrupt.data['planifi-state-unreadable'], '{not json');

  // A partial state still loads (lenient), missing lists become empty
  const partial = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ transactions: [] }) });
  const state = loadState(defaults, partial);
  assert.deepEqual(state.goals, []);
  assert.deepEqual(state.transactions, []);
});
