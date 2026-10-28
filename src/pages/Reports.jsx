import React, { useState, useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import { resolveColor, useTheme } from '../utils/theme';
import {
  expensesByCategory,
  getComparisonRanges,
  getTrendRanges,
  percentChange,
  sumInRange
} from '../utils/periods';
import Chart from '../components/Chart';
import './Reports.css';

const PERIOD_OPTIONS = {
  week: { label: 'Esta semana', current: 'esta semana', previous: 'la semana pasada', previousOf: 'de la semana pasada', trendCount: 6, trendTitle: 'Últimas 6 semanas' },
  month: { label: 'Este mes', current: 'este mes', previous: 'el mes pasado', previousOf: 'del mes pasado', trendCount: 6, trendTitle: 'Últimos 6 meses' },
  quarter: { label: 'Este trimestre', current: 'este trimestre', previous: 'el trimestre pasado', previousOf: 'del trimestre pasado', trendCount: 4, trendTitle: 'Últimos 4 trimestres' },
  year: { label: 'Este año', current: 'este año', previous: 'el año pasado', previousOf: 'del año pasado', trendCount: 3, trendTitle: 'Últimos 3 años' }
};

const CATEGORY_PALETTE = [
  '--cat-maracuya', '--cat-caribe', '--cat-mango', '--cat-orquidea', '--cat-cielo',
  '--cat-cacao', '--income', '--expense', '--save', '--warn'
];

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const trendLabel = (start, period) => {
  switch (period) {
    case 'week':
      return formatShortDate(start);
    case 'quarter':
      return `T${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`;
    case 'year':
      return String(start.getFullYear());
    default:
      return capitalize(new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(start).replace('.', ''));
  }
};

// Says whether the change is good news: more income is good, more expenses is not
const Change = ({ value, higherIsBetter, previous }) => {
  if (value === null) {
    return <p className="rep-stat__change">Sin datos para comparar</p>;
  }
  const rounded = Math.round(value);
  if (rounded === 0) {
    return (
      <p className="rep-stat__change">
        <Minus aria-hidden="true" /> Igual que {previous}
      </p>
    );
  }
  const up = rounded > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <p className={`rep-stat__change text-tone ${up === higherIsBetter ? 'tone-income' : 'tone-expense'}`}>
      <Icon aria-hidden="true" />
      {Math.abs(rounded)}% {up ? 'más' : 'menos'} que {previous}
    </p>
  );
};

const Reports = () => {
  const { transactions, budgets, goals } = useAppContext();
  const { currentTheme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const option = PERIOD_OPTIONS[selectedPeriod];

  // Totales del período elegido y del mismo tramo del período anterior
  const { current, previous } = getComparisonRanges(selectedPeriod);
  const currentTotals = sumInRange(transactions, current);
  const previousTotals = sumInRange(transactions, previous);
  const balance = currentTotals.income - currentTotals.expenses;
  const previousBalance = previousTotals.income - previousTotals.expenses;
  const savingsRate = currentTotals.income > 0 ? (balance / currentTotals.income) * 100 : null;

  // Generar datos de gráficos usando useMemo para optimización (colores desde los tokens del tema)
  const chartData = useMemo(() => {
    const income = resolveColor('--income');
    const expense = resolveColor('--expense');
    const surface = resolveColor('--surface');

    // Tendencia real de los últimos períodos
    const trend = getTrendRanges(selectedPeriod, PERIOD_OPTIONS[selectedPeriod].trendCount).map((range) => ({
      label: trendLabel(range.start, selectedPeriod),
      ...sumInRange(transactions, range)
    }));

    const lineData = {
      labels: trend.map((t) => t.label),
      datasets: [
        {
          label: 'Ingresos',
          data: trend.map((t) => t.income),
          borderColor: income,
          backgroundColor: income,
          pointBackgroundColor: surface,
          fill: false
        },
        {
          label: 'Gastos',
          data: trend.map((t) => t.expenses),
          borderColor: expense,
          backgroundColor: expense,
          pointBackgroundColor: surface,
          fill: false
        }
      ]
    };

    // Gastos por categoría dentro del período, de mayor a menor
    const byCategory = Object.entries(expensesByCategory(transactions, getComparisonRanges(selectedPeriod).current))
      .sort(([, a], [, b]) => b - a);

    const doughnutData = byCategory.length === 0 ? null : {
      labels: byCategory.map(([category]) => category),
      datasets: [{
        data: byCategory.map(([, amount]) => amount),
        backgroundColor: byCategory.map((_, i) => resolveColor(CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]))
      }]
    };

    // Datos para gráfico de barras (presupuestos)
    const barData = {
      labels: budgets.length > 0 ? budgets.map(b => b.category) : ['Sin presupuestos'],
      datasets: [
        {
          label: 'Presupuesto',
          data: budgets.length > 0 ? budgets.map(b => b.limit) : [0],
          backgroundColor: resolveColor('--ink-faint', 0.25)
        },
        {
          label: 'Gastado',
          data: budgets.length > 0 ? budgets.map(b => b.spent) : [0],
          backgroundColor: resolveColor('--cat-mango')
        }
      ]
    };

    // Datos para gráfico de metas
    const goalsData = {
      labels: goals.length > 0 ? goals.map(g => g.title) : ['Sin metas'],
      datasets: [
        {
          label: 'Ahorrado',
          data: goals.length > 0 ? goals.map(g => g.saved) : [0],
          backgroundColor: resolveColor('--save')
        },
        {
          label: 'Meta',
          data: goals.length > 0 ? goals.map(g => g.target) : [0],
          backgroundColor: resolveColor('--ink-faint', 0.25)
        }
      ]
    };

    return {
      lineData,
      doughnutData,
      barData,
      goalsData
    };
    // currentTheme: token colors differ per theme
  }, [transactions, budgets, goals, selectedPeriod, currentTheme]);

  return (
    <div className="page reports">
      <header className="page-head">
        <div>
          <h1>Reportes</h1>
          <p>Cómo se ha movido tu plata.</p>
        </div>

        <div className="page-head__actions">
          <label className="visually-hidden" htmlFor="period-select">Período</label>
          <select
            id="period-select"
            className="control rep-period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            {Object.entries(PERIOD_OPTIONS).map(([value, period]) => (
              <option key={value} value={value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Métricas del período */}
      <section className="rep-summary" aria-label={`Resumen de ${option.current}`}>
        <div className="rep-stats">
          <div className="panel rep-stat rep-stat--wide">
            <p className="stat__label">Balance de {option.current}</p>
            <p className="rep-stat__value rep-stat__value--lg num">{formatCurrency(balance)}</p>
            <Change value={percentChange(balance, previousBalance)} higherIsBetter previous={option.previous} />
          </div>

          <div className="panel rep-stat">
            <p className="stat__label">Ingresos</p>
            <p className="rep-stat__value num">{formatCurrency(currentTotals.income)}</p>
            <Change value={percentChange(currentTotals.income, previousTotals.income)} higherIsBetter previous={option.previous} />
          </div>

          <div className="panel rep-stat">
            <p className="stat__label">Gastos</p>
            <p className="rep-stat__value num">{formatCurrency(currentTotals.expenses)}</p>
            <Change value={percentChange(currentTotals.expenses, previousTotals.expenses)} higherIsBetter={false} previous={option.previous} />
          </div>

          <div className="panel rep-stat rep-stat--wide">
            <p className="stat__label">Tasa de ahorro</p>
            <p className="rep-stat__value num">{savingsRate === null ? '—' : `${Math.round(savingsRate)}%`}</p>
            <p
              className={`rep-stat__change ${
                savingsRate === null ? '' : `text-tone ${savingsRate >= 0 ? 'tone-income' : 'tone-expense'}`
              }`}
            >
              {savingsRate === null
                ? `Sin ingresos registrados ${option.current}`
                : savingsRate >= 0
                  ? `No gastaste ${formatCurrency(balance)} de lo que entró`
                  : `Gastaste ${formatCurrency(-balance)} más de lo que entró`}
            </p>
          </div>
        </div>
        <p className="rep-footnote">Comparado con los mismos días {option.previousOf}.</p>
      </section>

      {/* Gráficos */}
      <div className="rep-charts">
        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Ingresos y gastos</h2>
              <p className="rep-chart-sub">{option.trendTitle}</p>
            </div>
          </div>
          <Chart type="line" data={chartData.lineData} height={240} ariaLabel={`Ingresos y gastos, ${option.trendTitle.toLowerCase()}`} />
        </section>

        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Gastos por categoría</h2>
              <p className="rep-chart-sub">{option.label}</p>
            </div>
          </div>
          {chartData.doughnutData ? (
            <Chart type="doughnut" data={chartData.doughnutData} height={260} ariaLabel={`Gastos por categoría, ${option.current}`} />
          ) : (
            <div className="empty">
              <strong>Sin gastos {option.current}</strong>
              <p>Cuando registres gastos verás aquí en qué se va tu plata.</p>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Presupuesto vs. gastado</h2>
              <p className="rep-chart-sub">Estado actual de tus presupuestos</p>
            </div>
          </div>
          <Chart type="bar" data={chartData.barData} height={240} ariaLabel="Presupuesto comparado con lo gastado por categoría" />
        </section>

        <section className="panel">
          <div className="panel__head">
            <div>
              <h2>Avance de metas</h2>
              <p className="rep-chart-sub">Lo acumulado en cada meta</p>
            </div>
          </div>
          <Chart type="bar" data={chartData.goalsData} height={240} ariaLabel="Ahorrado frente a la meta de cada objetivo" />
        </section>
      </div>
    </div>
  );
};

export default Reports;
