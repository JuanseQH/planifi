// Funciones de utilidad para manejo de temas
import React from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

// Tipos de tema disponibles
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Theme colors live in src/styles/tokens.css; this module only switches data-theme.
const DEFAULT_THEME = THEMES.DARK;

// Función para obtener el tema actual del sistema
const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
};

const readSavedTheme = () => {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
};

// Android draws the WebView edge-to-edge, so status bar icons must contrast with the header
const syncStatusBar = (theme) => {
  if (!Capacitor.isNativePlatform()) return;
  StatusBar.setStyle({ style: theme === THEMES.DARK ? Style.Dark : Style.Light }).catch(() => {});
};

// Función para obtener el tema actual
export const getCurrentTheme = () => {
  const savedTheme = readSavedTheme();

  if (savedTheme === THEMES.AUTO) {
    return getSystemTheme();
  }

  return savedTheme || DEFAULT_THEME;
};

// Preferencia guardada (puede ser 'auto'), a diferencia del tema efectivo
export const getSavedTheme = () => readSavedTheme() || DEFAULT_THEME;

// Función para establecer el tema
export const setTheme = (theme) => {
  // Guardar preferencia en localStorage
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Storage can be unavailable; the theme still applies for this session
  }

  const actualTheme = theme === THEMES.AUTO ? getSystemTheme() : theme;

  // Actualizar atributo data-theme en el documento
  document.documentElement.setAttribute('data-theme', actualTheme);
  syncStatusBar(actualTheme);

  // Disparar evento personalizado para notificar cambios
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: actualTheme, saved: theme } }));
};

// Función para inicializar el tema
export const initTheme = () => {
  setTheme(getSavedTheme());

  // Escuchar cambios en la preferencia del sistema
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (readSavedTheme() === THEMES.AUTO) {
      setTheme(THEMES.AUTO);
    }
  });
};

// Función para alternar entre temas
export const toggleTheme = () => {
  const currentTheme = getCurrentTheme();
  const nextTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  setTheme(nextTheme);
  return nextTheme;
};

// Función para obtener el tema siguiente en el ciclo
export const getNextTheme = () => {
  switch (getSavedTheme()) {
    case THEMES.LIGHT:
      return THEMES.DARK;
    case THEMES.DARK:
      return THEMES.AUTO;
    case THEMES.AUTO:
      return THEMES.LIGHT;
    default:
      return DEFAULT_THEME;
  }
};

// Función para obtener el nombre del tema
export const getThemeName = (theme) => {
  switch (theme) {
    case THEMES.LIGHT:
      return 'Claro';
    case THEMES.DARK:
      return 'Oscuro';
    case THEMES.AUTO:
      return 'Automático';
    default:
      return 'Oscuro';
  }
};

// Función para obtener la descripción del tema
export const getThemeDescription = (theme) => {
  switch (theme) {
    case THEMES.LIGHT:
      return 'Para revisar tus cuentas de día';
    case THEMES.DARK:
      return 'Descansa la vista de noche';
    case THEMES.AUTO:
      return 'Sigue el modo de tu celular';
    default:
      return 'Descansa la vista de noche';
  }
};

// Hook para leer y cambiar la preferencia de tema desde componentes React
export const useTheme = () => {
  const [savedTheme, setSavedThemeState] = React.useState(getSavedTheme);
  const [currentTheme, setCurrentThemeState] = React.useState(getCurrentTheme);

  React.useEffect(() => {
    const handleThemeChange = (event) => {
      setCurrentThemeState(event.detail.theme);
      setSavedThemeState(event.detail.saved);
    };

    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  return {
    currentTheme,
    savedTheme,
    setTheme,
    toggleTheme,
    getNextTheme,
    getThemeName,
    getThemeDescription
  };
};

// Resolve a CSS color token to rgba() so canvas libraries (Chart.js) can use it
export const resolveColor = (token, alpha = 1) => {
  const probe = document.createElement('canvas');
  probe.width = probe.height = 1;
  const ctx = probe.getContext('2d');
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  ctx.fillStyle = value || '#000';
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
