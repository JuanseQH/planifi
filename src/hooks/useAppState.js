import { useState, useEffect, useMemo } from 'react';
import { localDateToISO } from '../utils/formatters';
import { loadState, STORAGE_KEY } from '../utils/storage';
import { withSpent } from '../utils/budget';

const initialState = {
  user: {
    name: 'Usuario',
    email: 'usuario@ejemplo.com',
    currency: 'COP',
    language: 'es'
  },
  transactions: [
    {
      id: 1,
      title: 'Salario',
      amount: 2500000,
      type: 'income',
      category: 'Trabajo',
      date: new Date().toISOString(),
      description: 'Salario mensual'
    },
    {
      id: 2,
      title: 'Supermercado',
      amount: -150000,
      type: 'expense',
      category: 'Alimentación',
      date: new Date().toISOString(),
      description: 'Compra semanal'
    },
    {
      id: 3,
      title: 'Gasolina',
      amount: -80000,
      type: 'expense',
      category: 'Transporte',
      date: new Date().toISOString(),
      description: 'Combustible'
    },
    {
      id: 4,
      title: 'Freelance',
      amount: 500000,
      type: 'income',
      category: 'Trabajo',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Proyecto freelance'
    },
    {
      id: 5,
      title: 'Restaurante',
      amount: -120000,
      type: 'expense',
      category: 'Entretenimiento',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Cena con amigos'
    }
  ],
  budgets: [
    {
      id: 1,
      category: 'Alimentación',
      limit: 500000,
      period: 'month'
    },
    {
      id: 2,
      category: 'Transporte',
      limit: 300000,
      period: 'month'
    },
    {
      id: 3,
      category: 'Entretenimiento',
      limit: 200000,
      period: 'month'
    },
    {
      id: 4,
      category: 'Servicios',
      limit: 400000,
      period: 'month'
    }
  ],
  goals: [
    {
      id: 1,
      title: 'Vacaciones',
      target: 5000000,
      saved: 2000000,
      deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Viajes'
    },
    {
      id: 2,
      title: 'Fondo de Emergencia',
      target: 10000000,
      saved: 3500000,
      deadline: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Ahorros'
    },
    {
      id: 3,
      title: 'Nuevo Laptop',
      target: 3000000,
      saved: 800000,
      deadline: new Date(Date.now() + 4 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Tecnología'
    }
  ],
  categories: [
    { name: 'Trabajo', icon: '💼', color: '#10b981', type: 'income' },
    { name: 'Freelance', icon: '💻', color: '#3b82f6', type: 'income' },
    { name: 'Inversiones', icon: '📈', color: '#f59e0b', type: 'income' },
    { name: 'Alimentación', icon: '🍽️', color: '#ef4444', type: 'expense' },
    { name: 'Transporte', icon: '🚗', color: '#8b5cf6', type: 'expense' },
    { name: 'Entretenimiento', icon: '🎬', color: '#ec4899', type: 'expense' },
    { name: 'Servicios', icon: '🏠', color: '#06b6d4', type: 'expense' },
    { name: 'Salud', icon: '🏥', color: '#84cc16', type: 'expense' },
    { name: 'Educación', icon: '📚', color: '#f97316', type: 'expense' },
    { name: 'Ropa', icon: '👕', color: '#6366f1', type: 'expense' }
  ]
};

export const useAppState = () => {
  // Datos guardados validados: un respaldo dañado no puede dejar la app en blanco
  const [state, setState] = useState(() => loadState(initialState));

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked: keep working in memory for this session
    }
  }, [state]);

  // Lo gastado en cada presupuesto se calcula siempre desde las transacciones de su período
  const budgets = useMemo(() => withSpent(state.budgets, state.transactions), [state.budgets, state.transactions]);

  // Funciones para transacciones
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now() + Math.random(),
      date: transaction.date || new Date().toISOString()
    };
    
    // El gasto de los presupuestos se deriva de las transacciones (ver `budgets` arriba)
    setState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction]
    }));
  };

  const updateTransaction = (id, updates) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t.id === id ? { ...t, ...updates } : t
      )
    }));
  };

  const deleteTransaction = (id) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  // Funciones para presupuestos
  const addBudget = (budget) => {
    const newBudget = {
      ...budget,
      id: Date.now() + Math.random(),
      spent: budget.spent || 0
    };
    setState(prev => ({
      ...prev,
      budgets: [...prev.budgets, newBudget]
    }));
  };

  const updateBudget = (id, updates) => {
    setState(prev => ({
      ...prev,
      budgets: prev.budgets.map(b => 
        b.id === id ? { ...b, ...updates } : b
      )
    }));
  };

  const deleteBudget = (id) => {
    setState(prev => ({
      ...prev,
      budgets: prev.budgets.filter(b => b.id !== id)
    }));
  };

  // Funciones para metas
  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: Date.now() + Math.random(),
      saved: goal.saved || 0
    };
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  };

  const updateGoal = (id, updates) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => 
        g.id === id ? { ...g, ...updates } : g
      )
    }));
  };

  const deleteGoal = (id) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  // Funciones para usuario
  const updateUser = (updates) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, ...updates }
    }));
  };

  // Funciones de utilidad
  const getTotalIncome = () => {
    return state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getTotalSavings = () => {
    return state.goals.reduce((sum, goal) => sum + goal.saved, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getSavingsRate = () => {
    const income = getTotalIncome();
    return income > 0 ? (getTotalSavings() / income) * 100 : 0;
  };

  return {
    // Estado
    user: state.user,
    transactions: state.transactions,
    budgets,
    goals: state.goals,
    categories: state.categories,

    // Funciones de transacciones
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Funciones de presupuestos
    addBudget,
    updateBudget,
    deleteBudget,

    // Funciones de metas
    addGoal,
    updateGoal,
    deleteGoal,

    // Funciones de usuario
    updateUser,

    // Funciones de utilidad
    getTotalIncome,
    getTotalExpenses,
    getTotalSavings,
    getBalance,
    getSavingsRate
  };
};
