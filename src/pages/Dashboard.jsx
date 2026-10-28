import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, PiggyBank, Sprout } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import { getBudgetPercentage, getBudgetStatus } from '../utils/budget';
import CategoryIcon from '../components/CategoryIcon';
import './Dashboard.css';

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const Dashboard = () => {
  const { user, transactions, budgets, goals, getTotalIncome, getTotalExpenses, getTotalSavings } = useAppContext();

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const totalSavings = getTotalSavings();
  const balance = totalIncome - totalExpenses;

  const spentShare = totalIncome > 0 ? Math.min(totalExpenses / totalIncome, 1) : totalExpenses > 0 ? 1 : 0;
  const totalGoalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const savingsProgress = totalGoalTarget > 0 ? Math.min(totalSavings / totalGoalTarget, 1) : 0;

  const balanceNote = (() => {
    if (totalIncome === 0) return 'Registra tus ingresos para ver cuánto te queda.';
    if (balance < 0) return `Gastaste ${formatCurrency(-balance)} más de lo que entró.`;
    return `Te queda el ${Math.round((balance / totalIncome) * 100)}% de lo que entró.`;
  })();

  const today = capitalize(
    new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  );

  // Ordenar transacciones por fecha (más recientes primero)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="page dashboard">
      <header className="page-head">
        <div>
          <h1>Hola, {user?.name || 'de nuevo'}</h1>
          <p>{today}</p>
        </div>
      </header>

      <div className="dash-top">
        <section className="hero dash-hero" aria-labelledby="dash-balance-label">
          <Sprout className="hero__mark" strokeWidth={1.5} aria-hidden="true" />
          <p className="hero__label" id="dash-balance-label">Balance neto</p>
          <p className="hero__value num">{formatCurrency(balance)}</p>
          <p className="hero__note">{balanceNote}</p>

          <div
            className="meter meter--thick hero__meter dash-hero__meter"
            role="img"
            aria-label={`Has gastado el ${Math.round(spentShare * 100)}% de lo que entró`}
          >
            <div className="meter__fill" style={{ '--value': spentShare }}></div>
          </div>

          <dl className="hero__stats dash-hero__split">
            <div>
              <dt><ArrowDownLeft aria-hidden="true" /> Entró</dt>
              <dd className="num">{formatCurrency(totalIncome)}</dd>
            </div>
            <div>
              <dt><ArrowUpRight aria-hidden="true" /> Salió</dt>
              <dd className="num">{formatCurrency(totalExpenses)}</dd>
            </div>
          </dl>
        </section>

        <Link to="/goals" className="panel dash-savings">
          <span className="chip-icon chip-icon--lg tone-save" aria-hidden="true"><PiggyBank /></span>
          <div className="dash-savings__body">
            <p className="stat__label">Ahorrado en metas</p>
            <p className="dash-savings__value num">{formatCurrency(totalSavings)}</p>
          </div>
          <ChevronRight className="dash-savings__chevron" aria-hidden="true" />
          <div
            className="meter tone-save dash-savings__meter"
            role="progressbar"
            aria-label="Avance de tus metas"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(savingsProgress * 100)}
          >
            <div className="meter__fill" style={{ '--value': savingsProgress }}></div>
          </div>
          <p className="dash-savings__note">
            {goals.length === 0
              ? 'Crea tu primera meta de ahorro'
              : `${Math.round(savingsProgress * 100)}% de ${formatCurrency(totalGoalTarget)} · ${goals.length} ${goals.length === 1 ? 'meta' : 'metas'}`}
          </p>
        </Link>
      </div>

      <div className="dash-grid">
        <section className="panel" aria-labelledby="dash-recent-title">
          <div className="panel__head">
            <h2 id="dash-recent-title">Movimientos recientes</h2>
            <Link to="/transactions" className="panel__link">
              Ver todos <ChevronRight aria-hidden="true" size={16} />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="empty">
              <strong>Aún no hay movimientos</strong>
              <p>Registra tu primer ingreso o gasto y aquí verás lo último que pasó con tu plata.</p>
            </div>
          ) : (
            <ul className="tx-list">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="tx-row">
                  <CategoryIcon category={transaction.category} className="tx-row__icon" />
                  <span className="tx-row__title">{transaction.title}</span>
                  <span className="tx-row__meta">
                    {transaction.category} · {formatShortDate(transaction.date)}
                  </span>
                  <span className={`tx-row__amount ${transaction.type === 'income' ? 'tone-income' : ''}`}>
                    {transaction.type === 'income' ? '+' : '−'}{formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel" aria-labelledby="dash-budgets-title">
          <div className="panel__head">
            <h2 id="dash-budgets-title">Presupuestos</h2>
            <Link to="/budget" className="panel__link">
              Ver todos <ChevronRight aria-hidden="true" size={16} />
            </Link>
          </div>

          {budgets.length === 0 ? (
            <div className="empty">
              <strong>Sin presupuestos todavía</strong>
              <p>Ponle un tope a una categoría y te avisamos cuando te estés acercando.</p>
            </div>
          ) : (
            <ul className="dash-budgets">
              {budgets.slice(0, 3).map((budget) => {
                const percentage = getBudgetPercentage(budget);
                const status = getBudgetStatus(percentage);
                return (
                  <li key={budget.id} className="dash-budget">
                    <div className="dash-budget__top">
                      <CategoryIcon category={budget.category} />
                      <div className="dash-budget__text">
                        <span className="dash-budget__name">{budget.category}</span>
                        <span className="dash-budget__amount num">
                          {formatCurrency(budget.spent)} de {formatCurrency(budget.limit)}
                        </span>
                      </div>
                      <span className={`badge ${status.tone}`}>{status.label}</span>
                    </div>
                    <div
                      className={`meter ${status.tone}`}
                      role="progressbar"
                      aria-label={`${budget.category}: ${Math.round(percentage)}% usado`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(Math.min(percentage, 100))}
                    >
                      <div className="meter__fill" style={{ '--value': Math.min(percentage, 100) / 100 }}></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
