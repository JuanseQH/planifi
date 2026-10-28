import React from 'react';
import {
  Briefcase,
  Car,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  Package,
  PiggyBank,
  Plane,
  Shirt,
  ShoppingBasket,
  TrendingUp,
} from 'lucide-react';

const CATEGORY_STYLES = {
  Trabajo: { Icon: Briefcase, tone: 'maracuya' },
  Freelance: { Icon: Laptop, tone: 'caribe' },
  Inversiones: { Icon: TrendingUp, tone: 'cielo' },
  Alimentación: { Icon: ShoppingBasket, tone: 'mango' },
  Transporte: { Icon: Car, tone: 'caribe' },
  Entretenimiento: { Icon: Clapperboard, tone: 'orquidea' },
  Servicios: { Icon: House, tone: 'cielo' },
  Salud: { Icon: HeartPulse, tone: 'orquidea' },
  Educación: { Icon: GraduationCap, tone: 'maracuya' },
  Ropa: { Icon: Shirt, tone: 'orquidea' },
  Viajes: { Icon: Plane, tone: 'caribe' },
  Ahorros: { Icon: PiggyBank, tone: 'cielo' },
  Tecnología: { Icon: Laptop, tone: 'cacao' },
};

const FALLBACK = { Icon: Package, tone: 'cacao' };

const CategoryIcon = ({ category, size = 'md', className = '' }) => {
  const { Icon, tone } = CATEGORY_STYLES[category] || FALLBACK;
  const sizeClass = size === 'lg' ? ' chip-icon--lg' : '';

  return (
    <span className={`chip-icon tone-${tone}${sizeClass} ${className}`.trim()} aria-hidden="true">
      <Icon strokeWidth={2} />
    </span>
  );
};

export default CategoryIcon;
