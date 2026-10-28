import React, { useState } from 'react';
import { BookOpen, ChevronRight, CircleHelp, Download, Mail, RotateCcw, ShieldCheck, Upload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { showSuccess, showError, showConfirmation } from '../utils/notifications';
import { THEMES, useTheme } from '../utils/theme';
import { normalizeState, STORAGE_KEY } from '../utils/storage';
import { saveFile } from '../utils/saveFile';
import './Settings.css';

const themeChoices = [THEMES.DARK, THEMES.LIGHT, THEMES.AUTO];

const usefulLinks = [
  { Icon: BookOpen, title: 'Guía de uso', text: 'Aprende a sacarle provecho a Planifi' },
  { Icon: CircleHelp, title: 'Preguntas frecuentes', text: 'Resuelve tus dudas sobre la app' },
  { Icon: Mail, title: 'Contacto', text: 'Cuéntanos qué mejorarías' },
  { Icon: ShieldCheck, title: 'Política de privacidad', text: 'Cómo cuidamos tus datos' }
];

const Settings = () => {
  const appState = useAppContext();
  const { user, updateUser } = appState;
  const { savedTheme, setTheme, getThemeName, getThemeDescription } = useTheme();

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    currency: user.currency || 'COP',
    language: user.language || 'es'
  });

  const currencies = [
    { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    updateUser(formData);
    showSuccess('Cambios guardados');
  };

  const handleReset = async () => {
    const confirmed = await showConfirmation('Se borran todas tus transacciones, presupuestos y metas. Esta acción no se puede deshacer.', {
      title: '¿Restablecer todos los datos?',
      confirmLabel: 'Restablecer'
    });
    if (confirmed) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const handleExport = async () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        showError('Aún no hay datos para exportar');
        return;
      }
      const saved = await saveFile({
        filename: `planifi-backup-${new Date().toISOString().split('T')[0]}.json`,
        content: data,
        mimeType: 'application/json'
      });
      if (saved) showSuccess('Respaldo exportado');
    } catch {
      showError('No pudimos exportar el respaldo. Intenta de nuevo.');
    }
  };

  const handleImport = (e) => {
    const input = e.target;
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Nothing is written unless the file is a valid Planifi backup
        let imported = null;
        try {
          imported = normalizeState(JSON.parse(event.target.result), appState, { strict: true });
        } catch {
          imported = null;
        }
        if (!imported) {
          showError('Ese archivo no es un respaldo de Planifi. Tus datos no cambiaron.');
          return;
        }
        const { user: importedUser, transactions, budgets, goals, categories } = imported;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: importedUser, transactions, budgets, goals, categories }));
        showSuccess('Datos importados');
        window.location.reload();
      };
      reader.onerror = () => showError('No pudimos leer el archivo.');
      reader.readAsText(file);
    }
    // Allow choosing the same file again after an error
    input.value = '';
  };

  return (
    <div className="page settings">
      <header className="page-head">
        <div>
          <h1>Configuración</h1>
          <p>Tu perfil, la apariencia y tus datos.</p>
        </div>
      </header>

      {/* Perfil de Usuario */}
      <section className="panel" aria-labelledby="settings-profile">
        <div className="panel__head">
          <h2 id="settings-profile">Perfil</h2>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <label className="field">
              <span className="field__label">Nombre *</span>
              <input
                className="control"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Tu nombre"
              />
            </label>

            <label className="field">
              <span className="field__label">Email *</span>
              <input
                className="control"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="tu@email.com"
              />
            </label>

            <label className="field field--full">
              <span className="field__label">Divisa de los montos</span>
              <select
                className="control"
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name}
                  </option>
                ))}
              </select>
            </label>

          </div>

          <div className="settings-form-actions">
            <button type="submit" className="btn btn--primary">
              Guardar cambios
            </button>
          </div>
        </form>
      </section>

      {/* Apariencia */}
      <section className="panel" aria-labelledby="settings-theme">
        <div className="panel__head">
          <h2 id="settings-theme">Apariencia</h2>
        </div>
        <div className="segmented" role="group" aria-label="Tema">
          {themeChoices.map((theme) => (
            <button
              key={theme}
              type="button"
              className="segmented__btn"
              aria-pressed={savedTheme === theme}
              onClick={() => setTheme(theme)}
            >
              {getThemeName(theme)}
            </button>
          ))}
        </div>
        <p className="settings-hint">{getThemeDescription(savedTheme)}</p>
      </section>

      {/* Datos y Respaldo */}
      <section className="panel" aria-labelledby="settings-data">
        <div className="panel__head">
          <h2 id="settings-data">Datos y respaldo</h2>
        </div>
        <ul className="settings-list">
          <li>
            <button type="button" onClick={handleExport} className="settings-row settings-row--link">
              <span className="chip-icon tone-save" aria-hidden="true"><Download /></span>
              <span className="settings-row__text">
                <span className="settings-row__title">Exportar datos</span>
                <span className="settings-row__desc">Descarga una copia de toda tu información</span>
              </span>
              <ChevronRight className="settings-row__chevron" aria-hidden="true" />
            </button>
          </li>

          <li>
            <label className="settings-row settings-row--link">
              <span className="chip-icon tone-cielo" aria-hidden="true"><Upload /></span>
              <span className="settings-row__text">
                <span className="settings-row__title">Importar datos</span>
                <span className="settings-row__desc">Restaura desde un archivo de respaldo</span>
              </span>
              <ChevronRight className="settings-row__chevron" aria-hidden="true" />
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="visually-hidden"
              />
            </label>
          </li>

          <li>
            <button type="button" onClick={handleReset} className="settings-row settings-row--link settings-row--danger">
              <span className="chip-icon tone-expense" aria-hidden="true"><RotateCcw /></span>
              <span className="settings-row__text">
                <span className="settings-row__title">Restablecer datos</span>
                <span className="settings-row__desc">Borra todo y vuelve al estado inicial</span>
              </span>
              <ChevronRight className="settings-row__chevron" aria-hidden="true" />
            </button>
          </li>
        </ul>
      </section>

      {/* Información de la Aplicación */}
      <section className="panel" aria-labelledby="settings-info">
        <div className="panel__head">
          <h2 id="settings-info">Información</h2>
        </div>
        <dl className="settings-info">
          <div>
            <dt>Versión</dt>
            <dd>1.0.0</dd>
          </div>
          <div>
            <dt>Desarrollado por</dt>
            <dd>Planifi Team</dd>
          </div>
          <div>
            <dt>Tecnologías</dt>
            <dd>React, Vite, Chart.js</dd>
          </div>
          <div>
            <dt>Licencia</dt>
            <dd>MIT</dd>
          </div>
        </dl>
      </section>

      {/* Enlaces Útiles */}
      <section className="panel" aria-labelledby="settings-links">
        <div className="panel__head">
          <h2 id="settings-links">Enlaces útiles</h2>
        </div>
        <ul className="settings-list">
          {usefulLinks.map(({ Icon, title, text }) => (
            <li key={title}>
              <a href="#" className="settings-row settings-row--link">
                <span className="chip-icon tone-neutral" aria-hidden="true"><Icon /></span>
                <span className="settings-row__text">
                  <span className="settings-row__title">{title}</span>
                  <span className="settings-row__desc">{text}</span>
                </span>
                <ChevronRight className="settings-row__chevron" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Settings;
