import { ArrowLeftRight, ChartColumn, House, Settings, Target, Wallet } from 'lucide-react';

// Single source for app navigation: the desktop sidebar shows all items, the mobile
// bottom bar shows the `tab` ones (Configuración lives in the header there).
export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Inicio', Icon: House, tab: true },
  { path: '/transactions', label: 'Transacciones', shortLabel: 'Movimientos', Icon: ArrowLeftRight, tab: true },
  { path: '/budget', label: 'Presupuesto', Icon: Wallet, tab: true },
  { path: '/goals', label: 'Metas', Icon: Target, tab: true },
  { path: '/reports', label: 'Reportes', Icon: ChartColumn, tab: true },
  { path: '/settings', label: 'Configuración', Icon: Settings, tab: false }
];
