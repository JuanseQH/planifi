import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, formatShortDate, createLocalDate, localDateToISO } from '../utils/formatters';
import { showSuccess, showError, showConfirmation } from '../utils/notifications';
import { exportTransactionsToCSV } from '../utils/exportUtils';
import CategoryIcon from '../components/CategoryIcon';
import './Transactions.css';

const typeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Ingresos' },
  { value: 'expense', label: 'Gastos' }
];

const Transactions = () => {
  const { transactions, categories, addTransaction, deleteTransaction } = useAppContext();
  const location = useLocation();

  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    minAmount: '',
    maxAmount: '',
    searchTerm: ''
  });
  // Llegar desde la búsqueda global prellena el buscador con el movimiento elegido
  useEffect(() => {
    const searchTerm = location.state?.search;
    if (searchTerm) {
      setFilters(prev => ({ ...prev, type: 'all', category: 'all', minAmount: '', maxAmount: '', searchTerm }));
    }
  }, [location.state]);

  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    date: createLocalDate(), // Usar la nueva función
    description: ''
  });

  // Filtrar transacciones
  const filteredTransactions = transactions.filter(transaction => {
    if (filters.type !== 'all' && transaction.type !== filters.type) return false;
    if (filters.category !== 'all' && transaction.category !== filters.category) return false;
    if (filters.minAmount && Math.abs(transaction.amount) < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && Math.abs(transaction.amount) > parseFloat(filters.maxAmount)) return false;
    if (filters.searchTerm && !transaction.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    return true;
  });

  // Ordenar transacciones
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'amount':
        aValue = Math.abs(a.amount);
        bValue = Math.abs(b.amount);
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'category':
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      default:
        aValue = new Date(a.date);
        bValue = new Date(b.date);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || !formData.category) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    const transaction = {
      ...formData,
      amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
      date: localDateToISO(formData.date) // Convertir a ISO string preservando la fecha local
    };

    addTransaction(transaction);
    setFormData({
      title: '',
      amount: '',
      type: 'expense',
      category: '',
      date: createLocalDate(), // Usar la nueva función
      description: ''
    });
    setShowForm(false);
    showSuccess('Transacción guardada');
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirmation('Esta transacción se borra de tu historial y no se puede recuperar.', {
      title: '¿Eliminar transacción?',
      confirmLabel: 'Eliminar'
    });
    if (confirmed) {
      deleteTransaction(id);
      showSuccess('Transacción eliminada');
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportTransactionsToCSV(transactions);
      if (result === 'empty') showError('No hay transacciones para exportar');
      if (result === 'saved') showSuccess('Transacciones exportadas en CSV');
    } catch {
      showError('No pudimos exportar el archivo. Intenta de nuevo.');
    }
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const extraFiltersActive =
    filters.category !== 'all' || filters.minAmount !== '' || filters.maxAmount !== '' || sortBy !== 'date' || sortOrder !== 'desc';

  return (
    <div className="page transactions">
      <header className="page-head">
        <div>
          <h1>Transacciones</h1>
          <p>Todo lo que entra y sale de tu bolsillo.</p>
        </div>

        <div className="page-head__actions">
          <button className="btn btn--primary" onClick={() => setShowForm(true)}>
            <Plus strokeWidth={2.5} aria-hidden="true" />
            Nueva transacción
          </button>
          <button
            className="btn btn--ghost btn--icon"
            onClick={handleExport}
            aria-label="Exportar transacciones en CSV"
            title="Exportar CSV"
          >
            <Download aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Filtros */}
      <section className="tx-filters" aria-label="Filtros">
        <div className="control-icon">
          <Search aria-hidden="true" />
          <input
            className="control"
            type="search"
            placeholder="Buscar por nombre"
            aria-label="Buscar transacciones"
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
        </div>

        <div className="segmented" role="group" aria-label="Tipo de transacción">
          {typeOptions.map(option => (
            <button
              key={option.value}
              type="button"
              className="segmented__btn"
              aria-pressed={filters.type === option.value}
              onClick={() => setFilters(prev => ({ ...prev, type: option.value }))}
            >
              {option.label}
            </button>
          ))}
        </div>

        <details className="tx-more">
          <summary>
            <SlidersHorizontal aria-hidden="true" />
            Más filtros y orden
            {extraFiltersActive && <span className="tx-more__dot" aria-label="(activos)"></span>}
          </summary>

          <div className="tx-more__body">
            <label className="field">
              <span className="field__label">Categoría</span>
              <select
                className="control"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="all">Todas</option>
                {filters.type === 'income' || filters.type === 'all' ?
                  incomeCategories.map((category, index) => (
                    <option key={`income-${index}`} value={category.name}>{category.name}</option>
                  )) : null
                }
                {filters.type === 'expense' || filters.type === 'all' ?
                  expenseCategories.map((category, index) => (
                    <option key={`expense-${index}`} value={category.name}>{category.name}</option>
                  )) : null
                }
              </select>
            </label>

            <div className="form-grid--pair form-grid">
              <label className="field">
                <span className="field__label">Monto mínimo</span>
                <input
                  className="control"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                />
              </label>
              <label className="field">
                <span className="field__label">Monto máximo</span>
                <input
                  className="control"
                  type="number"
                  inputMode="numeric"
                  placeholder="Sin límite"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                />
              </label>
            </div>

            <div className="form-grid--pair form-grid">
              <label className="field">
                <span className="field__label">Ordenar por</span>
                <select className="control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="date">Fecha</option>
                  <option value="amount">Monto</option>
                  <option value="title">Título</option>
                  <option value="category">Categoría</option>
                </select>
              </label>
              <label className="field">
                <span className="field__label">Orden</span>
                <select className="control" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="desc">Descendente</option>
                  <option value="asc">Ascendente</option>
                </select>
              </label>
            </div>
          </div>
        </details>
      </section>

      {/* Formulario de nueva transacción */}
      {showForm && (
        <div className="sheet-scrim">
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="tx-form-title">
            <div className="sheet__head">
              <h2 id="tx-form-title">Nueva transacción</h2>
              <button className="icon-btn" onClick={() => setShowForm(false)} aria-label="Cerrar">
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="segmented" role="group" aria-label="Tipo">
                {typeOptions.slice(1).map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className="segmented__btn"
                    aria-pressed={formData.type === option.value}
                    onClick={() => setFormData(prev => ({ ...prev, type: option.value, category: '' }))}
                  >
                    {option.value === 'income' ? 'Ingreso' : 'Gasto'}
                  </button>
                ))}
              </div>

              <div className="form-grid">
                <label className="field">
                  <span className="field__label">Título *</span>
                  <input
                    className="control"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Salario, Supermercado…"
                    required
                  />
                </label>

                <label className="field">
                  <span className="field__label">Monto *</span>
                  <input
                    className="control"
                    type="number"
                    inputMode="numeric"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="any"
                    required
                  />
                </label>

                <label className="field">
                  <span className="field__label">Categoría *</span>
                  <select
                    className="control"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {formData.type === 'income' ?
                      incomeCategories.map((category, index) => (
                        <option key={`income-${index}`} value={category.name}>{category.name}</option>
                      )) :
                      expenseCategories.map((category, index) => (
                        <option key={`expense-${index}`} value={category.name}>{category.name}</option>
                      ))
                    }
                  </select>
                </label>

                <label className="field">
                  <span className="field__label">Fecha</span>
                  <input
                    className="control"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </label>

                <label className="field field--full">
                  <span className="field__label">Descripción</span>
                  <input
                    className="control"
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Opcional"
                  />
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

      {/* Lista de transacciones */}
      <section className="panel" aria-labelledby="tx-list-title">
        <div className="panel__head">
          <h2 id="tx-list-title">Movimientos</h2>
          <span className="tx-count num">{sortedTransactions.length}</span>
        </div>

        {sortedTransactions.length === 0 ? (
          <div className="empty">
            <strong>No encontramos movimientos</strong>
            <p>
              {transactions.length === 0
                ? 'Registra tu primer ingreso o gasto con “Nueva transacción”.'
                : 'Prueba con otra búsqueda o ajusta los filtros.'}
            </p>
          </div>
        ) : (
          <ul className="tx-list">
            {sortedTransactions.map((transaction) => (
              <li key={transaction.id} className="tx-row tx-row--actions">
                <CategoryIcon category={transaction.category} className="tx-row__icon" />
                <span className="tx-row__title">{transaction.title}</span>
                <span className="tx-row__meta">
                  {transaction.category} · {formatShortDate(transaction.date)}
                </span>
                {transaction.description && (
                  <span className="tx-row__note">{transaction.description}</span>
                )}
                <span className={`tx-row__amount ${transaction.type === 'income' ? 'tone-income' : ''}`}>
                  {transaction.type === 'income' ? '+' : '−'}{formatCurrency(Math.abs(transaction.amount))}
                </span>
                <button
                  className="icon-btn icon-btn--sm icon-btn--danger tx-row__action"
                  onClick={() => handleDelete(transaction.id)}
                  aria-label={`Eliminar ${transaction.title}`}
                >
                  <Trash2 />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Transactions;
