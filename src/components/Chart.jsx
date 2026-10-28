import React, { useRef, useEffect, useState } from 'react';
import { resolveColor } from '../utils/theme';
import { formatCompactCurrency } from '../utils/formatters';
import './Chart.css';

// Stable default: a new {} per render would re-create the chart on every render
const NO_OPTIONS = {};
const RADIAL_TYPES = ['doughnut', 'pie', 'polarArea', 'radar'];

const buildDefaultOptions = (type) => {
  const ink = resolveColor('--ink');
  const inkSoft = resolveColor('--ink-soft');
  const inkFaint = resolveColor('--ink-faint');
  const line = resolveColor('--line');
  const raised = resolveColor('--raised');
  const surface = resolveColor('--surface');

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: inkSoft,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
          font: { size: 12, weight: 500 }
        }
      },
      tooltip: {
        backgroundColor: raised,
        titleColor: ink,
        bodyColor: inkSoft,
        borderColor: line,
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true
      }
    },
    elements: {
      point: { radius: 3, hoverRadius: 6, borderWidth: 2 },
      // monotone keeps the smoothed curve from dipping below $0 between data points
      line: { tension: 0.4, cubicInterpolationMode: 'monotone', borderWidth: 2.5 },
      bar: { borderRadius: 8, borderSkipped: false },
      arc: { borderColor: surface, borderWidth: 3 }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  if (RADIAL_TYPES.includes(type)) {
    options.cutout = '68%';
    options.interaction = { intersect: true, mode: 'nearest' };
  } else {
    options.scales = {
      x: {
        grid: { display: false },
        border: { color: line },
        ticks: { color: inkFaint, font: { size: 11 } }
      },
      y: {
        grid: { color: line },
        border: { display: false },
        ticks: {
          color: inkFaint,
          font: { size: 11 },
          callback: (value) => formatCompactCurrency(value)
        }
      }
    };
  }

  return options;
};

const Chart = ({
  type = 'line',
  data,
  options = NO_OPTIONS,
  title = '',
  height = 300,
  className = '',
  onChartClick = null,
  ariaLabel = ''
}) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [themeVersion, setThemeVersion] = useState(0);

  // Re-create the chart with the new token colors when the theme changes
  useEffect(() => {
    const handleThemeChange = () => setThemeVersion((v) => v + 1);
    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadChart = async () => {
      try {
        setError(null);

        // Verificar que tenemos datos válidos
        if (!data || !data.labels || !data.datasets) {
          setError('Datos del gráfico no válidos');
          setIsLoading(false);
          return;
        }

        // Importar Chart.js dinámicamente
        const { Chart: ChartJS } = await import('chart.js/auto');
        // The canvas is always mounted, so it exists here even on the first load
        if (cancelled || !canvasRef.current) return;

        ChartJS.defaults.font.family = getComputedStyle(document.body).fontFamily;
        chartRef.current?.destroy();
        chartRef.current = new ChartJS(canvasRef.current, {
          type,
          data,
          options: {
            ...buildDefaultOptions(type),
            ...options,
            onClick: onChartClick
          }
        });
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Error loading chart:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadChart();
    return () => {
      cancelled = true;
    };
  }, [type, data, options, onChartClick, themeVersion]);

  // Limpiar al desmontar
  useEffect(() => () => chartRef.current?.destroy(), []);

  return (
    <div className={`chart ${className}`.trim()}>
      {title && <h3 className="chart__title">{title}</h3>}
      <div className="chart__canvas" style={{ height }}>
        <canvas ref={canvasRef} role="img" aria-label={ariaLabel || title || 'Gráfico'}></canvas>

        {isLoading && !error && <div className="chart__skeleton" aria-label="Cargando gráfico"></div>}

        {error && (
          <div className="chart__error" role="alert">
            <strong>No pudimos dibujar el gráfico</strong>
            <small>{error}</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chart;
