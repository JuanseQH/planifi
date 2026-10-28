import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { NAV_ITEMS } from './navItems';
import './Sidebar.css';

// Desktop navigation rail; phones and tablets use BottomNav instead
const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="sidebar" aria-label="Menú">
      <nav className="sidebar__nav">
        <ul>
          {NAV_ITEMS.map(({ path, label, Icon }) => {
            const active = location.pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`sidebar__link ${active ? 'active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon strokeWidth={2} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar__foot">
        <Link to="/transactions" className="btn btn--primary btn--block">
          <Plus strokeWidth={2.5} />
          Nueva transacción
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
