/**
 * Utilidades para formateo de datos financieros
 */

// Divisa elegida en Configuración. AppProvider la actualiza para que todos los montos la usen.
let displayCurrency = 'COP';

export const setDisplayCurrency = (currency) => {
  try {
    new Intl.NumberFormat('es-CO', { style: 'currency', currency });
    displayCurrency = currency;
  } catch {
    // Unknown code (e.g. from an old backup): keep showing COP instead of crashing
    displayCurrency = 'COP';
  }
};

export const getDisplayCurrency = () => displayCurrency;

const currencyOptions = (currency) =>
  currency === 'COP'
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : // Cents only when there are any: "US$ 12,50" but "US$ 1.200"
      { minimumFractionDigits: 2, maximumFractionDigits: 2, trailingZeroDisplay: 'stripIfInteger' };

/**
 * Formatea un número como moneda (la divisa elegida en Configuración por defecto)
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda
 * @returns {string} Cantidad formateada como moneda
 */
export const formatCurrency = (amount, currency = displayCurrency) => {
  if (amount === null || amount === undefined) return '$0';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '$0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    ...currencyOptions(currency)
  }).format(numAmount);
};

// Montos cortos para ejes de gráficos: "$ 2,5 M"
export const formatCompactCurrency = (amount, currency = displayCurrency) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount);

/**
 * Convierte una fecha a Date. Las fechas sin hora ("2027-04-18", como las de <input type="date">)
 * se leen en hora local: new Date("2027-04-18") las toma como UTC y en Colombia mostraría el 17.
 */
export const parseLocalDate = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

// Días de calendario desde hoy hasta `date` (0 = hoy, negativo = ya pasó)
export const daysUntil = (date, now = new Date()) => {
  const target = parseLocalDate(date);
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // round absorbs the 23/25-hour days around daylight-saving changes
  return Math.round((startOfTarget - startOfToday) / 86400000);
};

/**
 * Formatea un número como porcentaje
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales (por defecto 1)
 * @returns {string} Valor formateado como porcentaje
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {string} locale - Locale para formateo (por defecto 'es-CO')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = parseLocalDate(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

/**
 * Formatea una fecha en formato corto
 * @param {string|Date} date - Fecha a formatear
 * @param {string} locale - Locale para formateo (por defecto 'es-CO')
 * @returns {string} Fecha formateada en formato corto
 */
export const formatShortDate = (date) => {
  if (!date) return '';
  
  const dateObj = parseLocalDate(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  // Compact for list rows: "19 oct", or "19 oct 2025" when it isn't the current year
  const showYear = dateObj.getFullYear() !== new Date().getFullYear();
  const parts = new Intl.DateTimeFormat('es-CO', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).formatToParts(dateObj);
  const part = (type) => parts.find((p) => p.type === type)?.value ?? '';
  const month = part('month').replace('.', '');
  
  return showYear ? `${part('day')} ${month} ${part('year')}` : `${part('day')} ${month}`;
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  
  const numValue = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('es-CO').format(numValue);
};

// Función para crear fechas en formato local sin problemas de zona horaria
export const createLocalDate = (dateString = null) => {
  if (dateString) {
    // Si se proporciona una fecha, convertirla a formato local
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } else {
    // Si no se proporciona fecha, usar la fecha actual en formato local
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

// Función para convertir fecha local a ISO string preservando la fecha local
export const localDateToISO = (dateString) => {
  if (!dateString) return new Date().toISOString();
  
  // Crear fecha en zona horaria local
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0); // Usar mediodía para evitar problemas de zona horaria
  
  return date.toISOString();
};

/**
 * Obtiene el color apropiado para un tipo de transacción
 * @param {string} type - Tipo de transacción ('income' o 'expense')
 * @returns {string} Clase CSS para el color
 */
export const getTransactionColor = (type) => {
  switch (type) {
    case 'income':
      return '#22c55e'; // Verde para ingresos
    case 'expense':
      return '#ef4444'; // Rojo para gastos
    default:
      return '#6b7280'; // Gris por defecto
  }
};
