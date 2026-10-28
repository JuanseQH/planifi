import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import './BottomNav.css';

const tabs = NAV_ITEMS.filter((item) => item.tab);

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <ul>
        {tabs.map(({ path, label, shortLabel, Icon }) => {
          const active = location.pathname === path;
          return (
            <li key={path}>
              <Link
                to={path}
                className={`bottom-nav__link ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="bottom-nav__icon" aria-hidden="true">
                  <Icon strokeWidth={active ? 2.25 : 2} />
                </span>
                <span className="bottom-nav__label">{shortLabel || label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
