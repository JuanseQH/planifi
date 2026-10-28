import React, { createContext, useContext } from 'react';
import { useAppState } from '../hooks/useAppState';
import { setDisplayCurrency } from '../utils/formatters';

// Crear el contexto
const AppContext = createContext();

// Hook personalizado para usar el contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe ser usado dentro de un AppProvider');
  }
  return context;
};

// Proveedor del contexto
export const AppProvider = ({ children }) => {
  const appState = useAppState();
  // Set during render (idempotent) so every formatCurrency below uses the chosen currency
  // on this same render, not one render late as an effect would.
  setDisplayCurrency(appState.user.currency || 'COP');

  return (
    <AppContext.Provider value={appState}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
