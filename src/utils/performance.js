// Funciones de utilidad para optimización de rendimiento

// Función para debounce
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Función para throttle
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Función para memoización simple
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

// Función para lazy loading de componentes
export const lazyLoad = (importFunc) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(importFunc());
    }, 100);
  });
};

// Función para limpiar localStorage periódicamente
export const cleanupStorage = () => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
    
    keys.forEach(key => {
      if (key.startsWith('temp_')) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const data = JSON.parse(item);
            if (data.timestamp && (now - data.timestamp) > maxAge) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  } catch (error) {
    console.warn('Error cleaning up storage:', error);
  }
};

// Función para optimizar imágenes
export const optimizeImage = (src, width = 400) => {
  if (!src) return src;
  
  // Si es una URL externa, agregar parámetros de optimización
  if (src.startsWith('http')) {
    const url = new URL(src);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', '80');
    return url.toString();
  }
  
  return src;
};

// Función para preload recursos críticos
export const preloadResource = (href, as = 'style') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Función para medir rendimiento
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

// Función para optimizar scroll
export const optimizeScroll = (callback, options = {}) => {
  const { throttleMs = 16, passive = true } = options;
  
  const throttledCallback = throttle(callback, throttleMs);
  
  return (event) => {
    event.preventDefault();
    throttledCallback(event);
  };
};

// Función para optimizar resize
export const optimizeResize = (callback) => {
  return debounce(callback, 250);
};

// Función para virtualización simple
export const createVirtualList = (items, itemHeight, containerHeight) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;
  
  return {
    visibleCount,
    totalHeight,
    getVisibleRange: (scrollTop) => {
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + visibleCount, items.length);
      return { start, end };
    },
    getVisibleItems: (scrollTop) => {
      const { start, end } = this.getVisibleRange(scrollTop);
      return items.slice(start, end);
    }
  };
};

// Función para optimizar búsqueda
export const optimizeSearch = (items, searchTerm, fields = []) => {
  if (!searchTerm || searchTerm.length < 2) return items;
  
  const term = searchTerm.toLowerCase();
  const searchFields = fields.length > 0 ? fields : Object.keys(items[0] || {});
  
  return items.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(term);
      }
      if (typeof value === 'number') {
        return value.toString().includes(term);
      }
      return false;
    });
  });
};

// Función para optimizar ordenamiento
export const optimizeSort = (items, sortBy, sortOrder = 'asc') => {
  return [...items].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });
};

// Función para optimizar filtros
export const optimizeFilters = (items, filters) => {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === '') return true;
      
      const itemValue = item[key];
      
      if (typeof value === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase());
      }
      
      if (typeof value === 'number') {
        return itemValue === value;
      }
      
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      
      return itemValue === value;
    });
  });
};

// Función para optimizar paginación
export const optimizePagination = (items, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    items: items.slice(start, end),
    total: items.length,
    pages: Math.ceil(items.length / pageSize),
    currentPage: page,
    hasNext: end < items.length,
    hasPrev: page > 1
  };
};
