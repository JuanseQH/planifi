// Funciones de utilidad para atajos de teclado

// Mapeo de atajos de teclado
const SHORTCUTS = {
  // Navegación
  'Ctrl+1': { action: 'navigate', target: '/dashboard', description: 'Ir al Dashboard' },
  'Ctrl+2': { action: 'navigate', target: '/transactions', description: 'Ir a Transacciones' },
  'Ctrl+3': { action: 'navigate', target: '/budget', description: 'Ir a Presupuesto' },
  'Ctrl+4': { action: 'navigate', target: '/goals', description: 'Ir a Metas' },
  'Ctrl+5': { action: 'navigate', target: '/reports', description: 'Ir a Reportes' },
  'Ctrl+6': { action: 'navigate', target: '/settings', description: 'Ir a Configuración' },
  
  // Acciones rápidas
  'Ctrl+N': { action: 'quickAction', target: 'newTransaction', description: 'Nueva Transacción' },
  'Ctrl+B': { action: 'quickAction', target: 'newBudget', description: 'Nuevo Presupuesto' },
  'Ctrl+G': { action: 'quickAction', target: 'newGoal', description: 'Nueva Meta' },
  'Ctrl+E': { action: 'quickAction', target: 'export', description: 'Exportar Datos' },
  
  // Búsqueda
  'Ctrl+K': { action: 'focus', target: 'search', description: 'Buscar' },
  'Ctrl+F': { action: 'focus', target: 'search', description: 'Buscar' },
  
  // Navegación del sistema
  'Escape': { action: 'system', target: 'closeModals', description: 'Cerrar Modales' },
  'F1': { action: 'system', target: 'showHelp', description: 'Mostrar Ayuda' },
  'Ctrl+/': { action: 'system', target: 'showShortcuts', description: 'Mostrar Atajos' }
};

// Estado global para callbacks
let callbacks = {};

// Función para registrar callbacks
export const registerShortcuts = (newCallbacks) => {
  callbacks = { ...callbacks, ...newCallbacks };
};

// Función para manejar la pulsación de teclas
const handleKeyDown = (event) => {
  // Ignorar si estamos en un input o textarea
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return;
  }

  // Construir la combinación de teclas
  const keys = [];
  if (event.ctrlKey || event.metaKey) keys.push('Ctrl');
  if (event.altKey) keys.push('Alt');
  if (event.shiftKey) keys.push('Shift');
  
  // Agregar la tecla principal
  const key = event.key.toUpperCase();
  if (key !== 'CONTROL' && key !== 'ALT' && key !== 'SHIFT') {
    keys.push(key);
  }
  
  const shortcut = keys.join('+');
  
  // Buscar el atajo
  const shortcutConfig = SHORTCUTS[shortcut];
  if (!shortcutConfig) return;
  
  // Prevenir comportamiento por defecto
  event.preventDefault();
  
  // Ejecutar la acción
  executeShortcut(shortcutConfig);
};

// Función para ejecutar el atajo
const executeShortcut = (shortcutConfig) => {
  const { action, target } = shortcutConfig;
  
  switch (action) {
    case 'navigate':
      if (callbacks.navigate) {
        callbacks.navigate(target);
      }
      break;
      
    case 'quickAction':
      if (callbacks.quickAction) {
        callbacks.quickAction(target);
      }
      break;
      
    case 'focus':
      if (callbacks.focus) {
        callbacks.focus(target);
      }
      break;
      
    case 'system':
      if (callbacks.system) {
        callbacks.system(target);
      }
      break;
  }
};

// Función para inicializar los atajos de teclado
export const initKeyboardShortcuts = () => {
  document.addEventListener('keydown', handleKeyDown);
};

// Función para limpiar los atajos de teclado
export const cleanupKeyboardShortcuts = () => {
  document.removeEventListener('keydown', handleKeyDown);
};

// Función para obtener todos los atajos disponibles
export const getAvailableShortcuts = () => {
  return Object.entries(SHORTCUTS).map(([key, config]) => ({
    key,
    description: config.description,
    action: config.action,
    target: config.target
  }));
};

// Función para mostrar ayuda de atajos
export const showShortcutsHelp = () => {
  const shortcuts = getAvailableShortcuts();
  
  const helpModal = document.createElement('div');
  helpModal.className = 'shortcuts-help-modal';
  helpModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10002;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  const categories = {
    'Navegación': shortcuts.filter(s => s.action === 'navigate'),
    'Acciones Rápidas': shortcuts.filter(s => s.action === 'quickAction'),
    'Búsqueda': shortcuts.filter(s => s.action === 'focus'),
    'Sistema': shortcuts.filter(s => s.action === 'system')
  };
  
  let modalContent = `
    <div class="shortcuts-content" style="
      background: white;
      padding: 32px;
      border-radius: 12px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    ">
      <div class="shortcuts-header" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e5e7eb;
      ">
        <h2 style="
          margin: 0;
          color: #1f2937;
          font-size: 24px;
          font-weight: 700;
        ">Atajos de Teclado</h2>
        <button class="close-btn" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        ">✕</button>
      </div>
  `;
  
  Object.entries(categories).forEach(([category, categoryShortcuts]) => {
    if (categoryShortcuts.length > 0) {
      modalContent += `
        <div class="shortcuts-category" style="margin-bottom: 24px;">
          <h3 style="
            margin: 0 0 12px 0;
            color: #374151;
            font-size: 16px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">${category}</h3>
          <div class="shortcuts-list">
      `;
      
      categoryShortcuts.forEach(shortcut => {
        modalContent += `
          <div class="shortcut-item" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
          ">
            <span style="
              color: #6b7280;
              font-size: 14px;
            ">${shortcut.description}</span>
            <kbd style="
              background: #f3f4f6;
              border: 1px solid #d1d5db;
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 12px;
              font-family: monospace;
              color: #374151;
              font-weight: 600;
            ">${shortcut.key}</kbd>
          </div>
        `;
      });
      
      modalContent += `
          </div>
        </div>
      `;
    }
  });
  
  modalContent += `
      <div class="shortcuts-footer" style="
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        color: #6b7280;
        font-size: 12px;
      ">
        Presiona Escape para cerrar
      </div>
    </div>
  `;
  
  helpModal.innerHTML = modalContent;
  document.body.appendChild(helpModal);
  
  // Event listeners
  const closeBtn = helpModal.querySelector('.close-btn');
  const closeModal = () => {
    helpModal.remove();
  };
  
  closeBtn.addEventListener('click', closeModal);
  
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      closeModal();
    }
  });
  
  // Cerrar con Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
};

// Función para mostrar notificación de atajo ejecutado
export const showShortcutNotification = (shortcut, description) => {
  // Crear notificación temporal
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1f2937;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10003;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideInUp 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <span style="font-weight: 600;">${shortcut}</span>
    <span>${description}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Remover después de 2 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOutDown 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }, 2000);
  
  // Agregar estilos de animación si no existen
  if (!document.getElementById('shortcut-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'shortcut-notification-styles';
    style.textContent = `
      @keyframes slideInUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
};
