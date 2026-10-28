import React, { useState } from 'react';
import { CalendarDays, Check, Plus, Target, Trash2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, formatPercentage, formatDate, daysUntil } from '../utils/formatters';
import { showSuccess, showError, showConfirmation } from '../utils/notifications';
import CategoryIcon from '../components/CategoryIcon';
import './Goals.css';

const STATUS_TONES = {
  success: 'tone-income',
  danger: 'tone-expense',
  warning: 'tone-warn',
  info: 'tone-save'
};

const Goals = () => {
  const { goals, addGoal, deleteGoal, updateGoal, categories } = useAppContext();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: '',
    saved: '0',
    deadline: '',
    category: '',
    priority: 'medium'
  });

  // Estado para manejar las actualizaciones de progreso
  const [progressUpdates, setProgressUpdates] = useState({});

  const priorities = [
    { value: 'low', label: 'Baja', tone: 'tone-neutral' },
    { value: 'medium', label: 'Media', tone: 'tone-neutral' },
    { value: 'high', label: 'Alta', tone: 'tone-accent' }
  ];

  const getPriorityInfo = (priority) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  const calculateProgress = (current, target) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  // Días de calendario, leyendo las fechas del formulario en hora local
  const calculateDaysRemaining = (deadline) => daysUntil(deadline);

  const getStatusColor = (progress, daysRemaining) => {
    if (progress >= 100) return 'success';
    if (daysRemaining < 30) return 'danger';
    if (daysRemaining < 90) return 'warning';
    return 'info';
  };

  const getStatusText = (progress, daysRemaining) => {
    if (progress >= 100) return '¡Completada!';
    if (daysRemaining < 0) return 'Vencida';
    if (daysRemaining < 30) return 'Urgente';
    if (daysRemaining < 90) return 'Próxima';
    return 'En progreso';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.target || !formData.category || !formData.deadline) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    const goal = {
      ...formData,
      target: parseFloat(formData.target),
      saved: parseFloat(formData.saved) || 0
    };

    addGoal(goal);
    setFormData({
      title: '',
      description: '',
      target: '',
      saved: '0',
      deadline: '',
      category: '',
      priority: 'medium'
    });
    setShowForm(false);
    showSuccess('Meta creada. ¡A ahorrar!');
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirmation('Perderás el registro de lo que llevas ahorrado en esta meta.', {
      title: '¿Eliminar meta?',
      confirmLabel: 'Eliminar'
    });
    if (confirmed) {
      deleteGoal(id);
      showSuccess('Meta eliminada');
    }
  };

  const handleUpdateProgress = (id, newAmount) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      const updatedAmount = Math.min(newAmount, goal.target);
      updateGoal(id, { saved: updatedAmount });
      showSuccess('Progreso actualizado');
    }
  };

  const handleProgressInputChange = (goalId, value) => {
    setProgressUpdates(prev => ({
      ...prev,
      [goalId]: value
    }));
  };

  const handleProgressSubmit = (goalId) => {
    const value = progressUpdates[goalId];
    if (value !== undefined && value !== '') {
      handleUpdateProgress(goalId, parseFloat(value) || 0);
      setProgressUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[goalId];
        return newUpdates;
      });
    }
  };

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => calculateProgress(g.saved, g.target) >= 100).length;
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <div className="page goals">
      <header className="page-head">
        <div>
          <h1>Metas</h1>
          <p>Lo que estás construyendo, paso a paso.</p>
        </div>

        <div className="page-head__actions">
          <button className="btn btn--primary" onClick={() => setShowForm(true)}>
            <Plus strokeWidth={2.5} aria-hidden="true" />
            Nueva meta
          </button>
        </div>
      </header>

      {/* Progreso general */}
      <section className="hero" aria-labelledby="goals-overall-label">
        <Target className="hero__mark" strokeWidth={1.5} aria-hidden="true" />
        <p className="hero__label" id="goals-overall-label">Progreso general</p>
        <p className="hero__value num">{formatPercentage(overallProgress, 0)}</p>
        <p className="hero__note num">
          {formatCurrency(totalCurrentAmount)} de {formatCurrency(totalTargetAmount)}
        </p>
        <div
          className="meter meter--thick hero__meter"
          role="progressbar"
          aria-label="Progreso general de tus metas"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(overallProgress)}
        >
          <div className="meter__fill" style={{ '--value': Math.min(overallProgress, 100) / 100 }}></div>
        </div>
        <dl className="hero__stats">
          <div>
            <dt>Metas</dt>
            <dd className="num">{totalGoals}</dd>
          </div>
          <div>
            <dt>Completadas</dt>
            <dd className="num">{completedGoals}</dd>
          </div>
        </dl>
      </section>

      {/* Formulario de nueva meta */}
      {showForm && (
        <div className="sheet-scrim">
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="goal-form-title">
            <div className="sheet__head">
              <h2 id="goal-form-title">Nueva meta</h2>
              <button className="icon-btn" onClick={() => setShowForm(false)} aria-label="Cerrar">
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-grid">
                <label className="field">
                  <span className="field__label">Título *</span>
                  <input
                    className="control"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Ej: Fondo de emergencia"
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
                    {categories.map((category, index) => (
                      <option key={`category-${index}`} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </label>

                <label className="field field--full">
                  <span className="field__label">Descripción</span>
                  <textarea
                    className="control"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="¿Para qué es esta meta?"
                    rows="3"
                  />
                </label>

                <label className="field">
                  <span className="field__label">Meta de ahorro *</span>
                  <input
                    className="control"
                    type="number"
                    inputMode="numeric"
                    value={formData.target}
                    onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                    required
                    min="0"
                    step="any"
                    placeholder="Ej: 5000000"
                  />
                </label>

                <label className="field">
                  <span className="field__label">Ya ahorrado</span>
                  <input
                    className="control"
                    type="number"
                    inputMode="numeric"
                    value={formData.saved}
                    onChange={(e) => setFormData(prev => ({ ...prev, saved: e.target.value }))}
                    min="0"
                    step="any"
                    placeholder="Ej: 1000000"
                  />
                </label>

                <label className="field">
                  <span className="field__label">Fecha límite *</span>
                  <input
                    className="control"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    required
                  />
                </label>

                <label className="field">
                  <span className="field__label">Prioridad</span>
                  <select
                    className="control"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary">
                  Crear meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de metas */}
      {goals.length === 0 ? (
        <section className="panel">
          <div className="empty">
            <span className="chip-icon chip-icon--lg tone-save" aria-hidden="true"><Target /></span>
            <strong>Tu primera meta te espera</strong>
            <p>Un viaje, un fondo de emergencia, un computador nuevo. Ponle cifra y fecha, y vamos sumando.</p>
            <button className="btn btn--primary" onClick={() => setShowForm(true)}>
              <Plus strokeWidth={2.5} aria-hidden="true" />
              Crear primera meta
            </button>
          </div>
        </section>
      ) : (
        <ul className="goals-list">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.saved, goal.target);
            const daysRemaining = calculateDaysRemaining(goal.deadline);
            const statusTone = STATUS_TONES[getStatusColor(progress, daysRemaining)];
            const statusText = getStatusText(progress, daysRemaining);
            const priorityInfo = getPriorityInfo(goal.priority);
            const currentProgressValue = progressUpdates[goal.id] || '';
            const completed = progress >= 100;

            return (
              <li key={goal.id} className="panel goal-card">
                <div className="goal-card__head">
                  <CategoryIcon category={goal.category} size="lg" />
                  <div className="goal-card__title">
                    <h2>{goal.title}</h2>
                    {goal.description && <p>{goal.description}</p>}
                  </div>
                  <button
                    className="icon-btn icon-btn--sm icon-btn--danger"
                    onClick={() => handleDelete(goal.id)}
                    aria-label={`Eliminar meta ${goal.title}`}
                  >
                    <Trash2 />
                  </button>
                </div>

                <div className="goal-card__badges">
                  <span className={`badge ${statusTone}`}>
                    {completed && <Check aria-hidden="true" />}
                    {statusText}
                  </span>
                  <span className={`badge ${priorityInfo.tone}`}>Prioridad {priorityInfo.label.toLowerCase()}</span>
                </div>

                <div className="goal-card__progress">
                  <span className={`goal-card__pct num ${completed ? 'tone-income text-tone' : ''}`}>
                    {formatPercentage(progress, 0)}
                  </span>
                  <span className="goal-card__amounts num">
                    {formatCurrency(goal.saved)} de {formatCurrency(goal.target)}
                  </span>
                </div>
                <div
                  className={`meter meter--thick ${completed ? 'tone-income' : 'tone-save'}`}
                  role="progressbar"
                  aria-label={`${goal.title}: ${formatPercentage(progress, 0)}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                >
                  <div className="meter__fill" style={{ '--value': progress / 100 }}></div>
                </div>

                <p className="goal-card__meta">
                  <CalendarDays aria-hidden="true" />
                  <span>
                    {formatDate(goal.deadline)} ·{' '}
                    {daysRemaining >= 0 ? `faltan ${daysRemaining} días` : `venció hace ${Math.abs(daysRemaining)} días`}
                  </span>
                </p>
                {!completed && (
                  <p className="goal-card__meta">
                    Te faltan <strong className="num">{formatCurrency(goal.target - goal.saved)}</strong>
                  </p>
                )}

                <div className="goal-card__update">
                  <label className="visually-hidden" htmlFor={`goal-update-${goal.id}`}>
                    Nuevo total ahorrado para {goal.title}
                  </label>
                  <input
                    id={`goal-update-${goal.id}`}
                    className="control"
                    type="number"
                    inputMode="numeric"
                    placeholder="Total ahorrado"
                    min="0"
                    max={goal.target}
                    step="any"
                    value={currentProgressValue}
                    onChange={(e) => handleProgressInputChange(goal.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleProgressSubmit(goal.id);
                      }
                    }}
                  />
                  <button
                    className="btn btn--ghost"
                    onClick={() => handleProgressSubmit(goal.id)}
                  >
                    Actualizar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Goals;
