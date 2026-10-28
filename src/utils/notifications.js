// Funciones de utilidad para notificaciones y alertas.
// Styling lives in src/styles/components.css (.toast, .sheet, .confirm).

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Configuración de notificaciones
const NOTIFICATION_CONFIG = {
  duration: 4000
};

// Lucide icon geometry, inlined because these nodes are built outside React
const svg = (paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const ICONS = {
  success: svg('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
  error: svg('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'),
  warning: svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
  close: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')
};

const TONES = {
  success: 'tone-income',
  error: 'tone-expense',
  warning: 'tone-warn',
  info: 'tone-save'
};

const dismissToast = (toast) => {
  if (!toast.isConnected || toast.classList.contains('toast--leaving')) return;
  toast.classList.add('toast--leaving');
  toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  // Fallback when transitions are disabled (reduced motion)
  setTimeout(() => toast.remove(), 400);
};

// Función para mostrar notificaciones
export const showNotification = (message, type = NOTIFICATION_TYPES.INFO, duration = NOTIFICATION_CONFIG.duration) => {
  // One toast at a time so they never stack on top of each other
  document.querySelectorAll('.toast').forEach((el) => el.remove());

  const toast = document.createElement('div');
  toast.className = `toast ${TONES[type] || TONES.info}`;
  toast.setAttribute('role', type === NOTIFICATION_TYPES.ERROR ? 'alert' : 'status');

  const icon = document.createElement('span');
  icon.className = 'toast__icon';
  icon.innerHTML = ICONS[type] || ICONS.info;

  const text = document.createElement('p');
  text.className = 'toast__message';
  text.textContent = message;

  const close = document.createElement('button');
  close.className = 'icon-btn icon-btn--sm';
  close.setAttribute('aria-label', 'Cerrar aviso');
  close.innerHTML = ICONS.close;
  close.addEventListener('click', () => dismissToast(toast));

  toast.append(icon, text, close);
  document.body.appendChild(toast);

  setTimeout(() => dismissToast(toast), duration);
};

// Funciones de conveniencia
export const showSuccess = (message, duration) => showNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
export const showError = (message, duration) => showNotification(message, NOTIFICATION_TYPES.ERROR, duration);
export const showWarning = (message, duration) => showNotification(message, NOTIFICATION_TYPES.WARNING, duration);
export const showInfo = (message, duration) => showNotification(message, NOTIFICATION_TYPES.INFO, duration);

// Función para mostrar confirmación. Resuelve true si la persona confirma.
export const showConfirmation = (message, { title = '¿Estás seguro?', confirmLabel = 'Confirmar' } = {}) =>
  new Promise((resolve) => {
    const scrim = document.createElement('div');
    scrim.className = 'sheet-scrim';

    const dialog = document.createElement('div');
    dialog.className = 'sheet confirm';
    dialog.setAttribute('role', 'alertdialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'confirm-title');
    dialog.setAttribute('aria-describedby', 'confirm-message');

    const icon = document.createElement('span');
    icon.className = 'chip-icon chip-icon--lg tone-expense';
    icon.innerHTML = ICONS.warning;

    const heading = document.createElement('h2');
    heading.id = 'confirm-title';
    heading.textContent = title;

    const text = document.createElement('p');
    text.id = 'confirm-message';
    text.textContent = message;

    const actions = document.createElement('div');
    actions.className = 'form-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn--ghost';
    cancelBtn.textContent = 'Cancelar';
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn--danger';
    confirmBtn.textContent = confirmLabel;
    actions.append(cancelBtn, confirmBtn);

    dialog.append(icon, heading, text, actions);
    scrim.appendChild(dialog);
    document.body.appendChild(scrim);
    cancelBtn.focus();

    const close = (result) => {
      document.removeEventListener('keydown', handleEscape);
      scrim.remove();
      resolve(result);
    };

    // Cerrar con Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') close(false);
    };

    cancelBtn.addEventListener('click', () => close(false));
    confirmBtn.addEventListener('click', () => close(true));
    // Cerrar al hacer clic fuera del diálogo
    scrim.addEventListener('click', (e) => {
      if (e.target === scrim) close(false);
    });
    document.addEventListener('keydown', handleEscape);
  });
