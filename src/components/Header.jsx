import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Settings, Sprout, X } from 'lucide-react';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const navLinks = [
  { path: '/dashboard', label: 'Inicio' },
  { path: '/transactions', label: 'Transacciones' },
  { path: '/budget', label: 'Presupuesto' },
  { path: '/goals', label: 'Metas' },
];

export const Logo = () => (
  <span className="logo">
    <span className="logo__mark" aria-hidden="true">
      <Sprout strokeWidth={2.25} />
    </span>
    <span className="logo__word">planifi</span>
  </span>
);

const Header = ({ searchRef }) => {
  const location = useLocation();
  // Phones: search opens as a panel under the header
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (searchOpen) searchRef?.current?.focus();
  }, [searchOpen, searchRef]);

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/dashboard" className="header__brand" aria-label="Planifi, ir al inicio">
          <Logo />
        </Link>

        <div className={`header__search ${searchOpen ? 'header__search--open' : ''}`}>
          <SearchBar ref={searchRef} onNavigate={() => setSearchOpen(false)} />
        </div>

        <nav className="header__nav" aria-label="Secciones principales">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
              aria-current={location.pathname === link.path ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header__actions">
          <button
            className="icon-btn header__search-toggle"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label={searchOpen ? 'Cerrar búsqueda' : 'Buscar'}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X /> : <Search />}
          </button>
          <ThemeToggle />
          {/* Phones/tablets: Configuración isn't a bottom tab, so it lives here */}
          <Link
            to="/settings"
            className={`icon-btn header__settings ${location.pathname === '/settings' ? 'active' : ''}`}
            aria-label="Configuración"
            aria-current={location.pathname === '/settings' ? 'page' : undefined}
          >
            <Settings />
          </Link>
          <div className="header__user">
            <div className="header__user-text">
              <span className="header__user-name">Usuario</span>
              <span className="header__user-email">usuario@ejemplo.com</span>
            </div>
            <div className="header__avatar" aria-hidden="true">U</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
