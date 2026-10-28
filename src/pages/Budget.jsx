import React, { useState } from 'react';
import { Plus, Trash2, Wallet, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { showSuccess, showError, showConfirmation } from '../utils/notifications';
import { getBudgetPercentage, getBudgetStatus } from '../utils/budget';
import CategoryIcon from '../components/CategoryIcon';
import './Budget.css';

const periodLabels = {
  week: 'Semanal',
  month: 'Mensual',
  quarter: 'Trimestral',
  year: 'Anual'
};

const Budget = () => {
  const { budgets, categories, addBudget, deleteBudget } = useAppContext();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'month'
  });

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.category || !formData.limit) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    const budget = {
      ...formData,
      limit: parseFloat(formData.limit),
      spent: 0
    };

    addBudget(budget);
    setFormData({
      category: '',
      limit: '',
      period: 'month'
    });
    setShowForm(false);
    showSuccess('Presupuesto creado');
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirmation('Dejarás de ver el seguimiento de esta categoría.', {
      title: '¿Eliminar presupuesto?',
      confirmLabel: 'Eliminar'
    });
    if (confirmed) {
      deleteBudget(id);
      showSuccess('Presupuesto eliminado');
    }
  };

  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + (b.limit - b.spent), 0);
  const overallShare = totalLimit > 0 ? Math.min(totalSpent / totalLimit, 1) : 0;

  return (
    <div className="page budget">
      <header className="page-head">
        <div>
          <h1>Presupuesto</h1>
          <p>Cuánto puedes gastar en cada categoría.</p>
        </div>

        <div className="page-head__actions">
          <button className="btn btn--primary" onClick={() => setShowForm(true)}>
            <Plus strokeWidth={2.5} aria-hidden="true" />
            Nuevo presupuesto
          </button>
        </div>
      </header>

      {/* Resumen de presupuestos */}
      <section className="hero" aria-labelledby="budget-remaining-label">
        <Wallet className="hero__mark" strokeWidth={1.5} aria-hidden="true" />
        <p className="hero__label" id="budget-remaining-label">Te queda por gastar</p>
        <p className="hero__value num">{formatCurrency(totalRemaining)}</p>
        <p className="hero__note">
          Llevas el {Math.round(overallShare * 100)}% de lo presupuestado
        </p>
        <div className="meter meter--thick hero__meter" role="img" aria-label={`Llevas el ${Math.round(overallShare * 100)}% de lo presupuestado`}>
          <div className="meter__fill" style={{ '--value': overallShare }}></div>
        </div>
        <dl className="hero__stats">
          <div>
            <dt>Gastado</dt>
            <dd className="num">{formatCurrency(totalSpent)}</dd>
          </div>
          <div>
            <dt>Presupuestado</dt>
            <dd className="num">{formatCurrency(totalLimit)}</dd>
          </div>
        </dl>
      </section>

      {/* Formulario de nuevo presupuesto */}
      {showForm && (
        <div className="sheet-scrim">
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="budget-form-title">
            <div className="sheet__head">
              <h2 id="budget-form-title">Nuevo presupuesto</h2>
              <button className="icon-btn" onClick={() => setShowForm(false)} aria-label="Cerrar">
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-grid">
                <label className="field">
                  <span className="field__label">Categoría *</span>
                  <select
                    className="control"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {expenseCategories.map((category, index) => (
                      <option key={`expense-${index}`} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field__label">Límite *</span>
                  <input
                    className="control"
                    type="number"
                    inputMode="numeric"
                    value={formData.limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="any"
                    required
                  />
                </label>

                <label className="field field--full">
                  <span className="field__label">Período</span>
                  <select
                    className="control"
                    value={formData.period}
                    onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                  >
                    <option value="week">Semanal</option>
                    <option value="month">Mensual</option>
                    <option value="quarter">Trimestral</option>
                    <option value="year">Anual</option>
                  </select>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de presupuestos */}
      <section className="panel" aria-labelledby="budget-list-title">
        <div className="panel__head">
          <h2 id="budget-list-title">Por categoría</h2>
        </div>

        {budgets.length === 0 ? (
          <div className="empty">
            <strong>Aún no tienes presupuestos</strong>
            <p>Ponle un tope a una categoría, como Alimentación, y verás cuánto te queda en el mes.</p>
            <button className="btn btn--primary" onClick={() => setShowForm(true)}>
              <Plus strokeWidth={2.5} aria-hidden="true" />
              Crear primer presupuesto
            </button>
          </div>
        ) : (
          <ul className="budget-list">
            {budgets.map((budget) => {
              const percentage = getBudgetPercentage(budget);
              const remaining = budget.limit - budget.spent;
              const status = getBudgetStatus(percentage);

              return (
                <li key={budget.id} className="budget-row">
                  <div className="budget-row__top">
                    <CategoryIcon category={budget.category} />
                    <div className="budget-row__text">
                      <h3>{budget.category}</h3>
                      <span>{periodLabels[budget.period] || budget.period}</span>
                    </div>
                    <button
                      className="icon-btn icon-btn--sm icon-btn--danger"
                      onClick={() => handleDelete(budget.id)}
                      aria-label={`Eliminar presupuesto de ${budget.category}`}
                    >
                      <Trash2 />
                    </button>
                  </div>

                  <div className="budget-row__bar">
                    <div
                      className={`meter ${status.tone}`}
                      role="progressbar"
                      aria-label={`${budget.category}: ${formatPercentage(percentage)} usado`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(Math.min(percentage, 100))}
                    >
                      <div className="meter__fill" style={{ '--value': Math.min(percentage, 100) / 100 }}></div>
                    </div>
                    <span className={`badge ${status.tone}`}>{status.label}</span>
                  </div>

                  <dl className="budget-row__amounts">
                    <div>
                      <dt>Gastado</dt>
                      <dd className="num">{formatCurrency(budget.spent)}</dd>
                    </div>
                    <div>
                      <dt>Límite</dt>
                      <dd className="num">{formatCurrency(budget.limit)}</dd>
                    </div>
                    <div>
                      <dt>Restante</dt>
                      <dd className={`num ${remaining < 0 ? 'tone-expense text-tone' : ''}`}>
                        {formatCurrency(remaining)}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Budget;
