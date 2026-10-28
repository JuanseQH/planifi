// Validation for app state coming from localStorage or an imported backup (untrusted input).
import { PERIODS } from './periods.js';

export const STORAGE_KEY = 'planifi-state';
const CORRUPT_KEY = 'planifi-state-unreadable';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isValidDate = (value) =>
  (typeof value === 'string' || typeof value === 'number') && !Number.isNaN(new Date(value).getTime());
const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
};
const text = (value, fallback = '') => (value === null || value === undefined ? fallback : String(value));
const fallbackId = (index) => `${Date.now()}-${index}`;

const cleanTransaction = (t, index) => {
  if (!isObject(t)) return null;
  const amount = toNumber(t.amount);
  if (!['income', 'expense'].includes(t.type) || !Number.isFinite(amount) || !isValidDate(t.date)) return null;
  return {
    ...t,
    id: t.id ?? fallbackId(index),
    amount,
    title: text(t.title, text(t.description, 'Sin título')),
    category: text(t.category, 'Otros'),
    description: text(t.description)
  };
};

const cleanBudget = (b, index) => {
  if (!isObject(b)) return null;
  const limit = toNumber(b.limit);
  if (!b.category || !Number.isFinite(limit) || limit < 0) return null;
  return {
    ...b,
    id: b.id ?? fallbackId(index),
    category: text(b.category),
    limit,
    period: PERIODS.includes(b.period) ? b.period : 'month'
  };
};

const cleanGoal = (g, index) => {
  if (!isObject(g)) return null;
  const target = toNumber(g.target);
  const saved = toNumber(g.saved ?? 0);
  if (!g.title || !Number.isFinite(target) || target <= 0 || !isValidDate(g.deadline)) return null;
  return {
    ...g,
    id: g.id ?? fallbackId(index),
    title: text(g.title),
    description: text(g.description),
    category: text(g.category, 'Otros'),
    target,
    saved: Number.isFinite(saved) && saved > 0 ? saved : 0,
    priority: ['low', 'medium', 'high'].includes(g.priority) ? g.priority : 'medium'
  };
};

const cleanList = (list, clean) => (Array.isArray(list) ? list.map(clean).filter(Boolean) : []);

/**
 * Returns a safe state built from `raw`, or null when `raw` is not Planifi data.
 * strict (imports): transactions, budgets and goals must all be arrays.
 * lenient (saved state): missing lists become empty so the app always starts.
 * Invalid items are dropped; missing fields get defaults.
 */
export const normalizeState = (raw, defaults, { strict = false } = {}) => {
  if (!isObject(raw)) return null;
  const hasLists = ['transactions', 'budgets', 'goals'].every((key) => Array.isArray(raw[key]));
  if (strict && !hasLists) return null;

  const user = isObject(raw.user) ? raw.user : {};
  const categories = cleanList(raw.categories, (c) =>
    isObject(c) && c.name && ['income', 'expense'].includes(c.type) ? { ...c, name: text(c.name) } : null
  );

  return {
    ...defaults,
    user: {
      ...defaults.user,
      ...Object.fromEntries(
        ['name', 'email', 'currency', 'language']
          .filter((key) => typeof user[key] === 'string' && user[key].trim() !== '')
          .map((key) => [key, user[key]])
      )
    },
    transactions: cleanList(raw.transactions, cleanTransaction),
    budgets: cleanList(raw.budgets, cleanBudget),
    goals: cleanList(raw.goals, cleanGoal),
    categories: categories.length > 0 ? categories : defaults.categories
  };
};

// Reads saved state; never throws. Unreadable data is kept aside instead of being overwritten.
export const loadState = (defaults, storage = localStorage) => {
  let saved = null;
  try {
    saved = storage.getItem(STORAGE_KEY);
    if (!saved) return defaults;
    const state = normalizeState(JSON.parse(saved), defaults);
    if (state) return state;
  } catch {
    // Falls through: corrupt JSON or storage unavailable
  }
  try {
    if (saved) storage.setItem(CORRUPT_KEY, saved);
  } catch {
    // Storage full or blocked; nothing else to preserve
  }
  return defaults;
};
