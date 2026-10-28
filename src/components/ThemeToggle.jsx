import React, { useState, useRef, useEffect } from 'react';
import { Check, Moon, Sun, SunMoon } from 'lucide-react';
import { THEMES, useTheme } from '../utils/theme';
import './ThemeToggle.css';

const themeOptions = [
  { id: THEMES.DARK, Icon: Moon },
  { id: THEMES.LIGHT, Icon: Sun },
  { id: THEMES.AUTO, Icon: SunMoon }
];

const ThemeToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { savedTheme, setTheme, getThemeName, getThemeDescription } = useTheme();
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setIsOpen(false);
    };
    const handleKey = (event) => event.key === 'Escape' && setIsOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  const CurrentIcon = (themeOptions.find((t) => t.id === savedTheme) || themeOptions[0]).Icon;

  return (
    <div className="theme-toggle" ref={rootRef}>
      <button
        className="icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Tema: ${getThemeName(savedTheme)}. Cambiar tema`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <CurrentIcon />
      </button>

      {isOpen && (
        <div className="theme-menu" role="menu" aria-label="Elegir tema">
          {themeOptions.map(({ id, Icon }) => {
            const active = savedTheme === id;
            return (
              <button
                key={id}
                role="menuitemradio"
                aria-checked={active}
                className={`theme-menu__option ${active ? 'active' : ''}`}
                onClick={() => handleThemeChange(id)}
              >
                <span className="chip-icon tone-accent" aria-hidden="true"><Icon /></span>
                <span className="theme-menu__text">
                  <span className="theme-menu__name">{getThemeName(id)}</span>
                  <span className="theme-menu__desc">{getThemeDescription(id)}</span>
                </span>
                {active && <Check className="theme-menu__check" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
