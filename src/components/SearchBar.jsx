import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import CategoryIcon from './CategoryIcon';
import './SearchBar.css';

// Case- and accent-insensitive: "alimentacion" finds "Alimentación". Safe on missing fields.
const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const SearchBar = forwardRef(({ onNavigate }, ref) => {
  const { transactions, budgets, goals } = useAppContext();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchResults = [];
    const term = normalize(searchTerm.trim());
    const matches = (...fields) => fields.some((field) => normalize(field).includes(term));

    // Buscar en transacciones
    transactions.forEach(transaction => {
      if (matches(transaction.title, transaction.description, transaction.category)) {
        searchResults.push({
          id: transaction.id,
          type: 'transaction',
          title: transaction.title,
          subtitle: `${transaction.category} · ${formatShortDate(transaction.date)}`,
          amount: `${transaction.type === 'income' ? '+' : '−'}${formatCurrency(Math.abs(transaction.amount))}`,
          category: transaction.category
        });
      }
    });

    // Buscar en presupuestos
    budgets.forEach(budget => {
      if (matches(budget.category)) {
        searchResults.push({
          id: budget.id,
          type: 'budget',
          title: budget.category,
          subtitle: `Presupuesto de ${formatCurrency(budget.limit)}`,
          amount: formatCurrency(budget.spent),
          category: budget.category
        });
      }
    });

    // Buscar en metas
    goals.forEach(goal => {
      if (matches(goal.title, goal.description, goal.category)) {
        searchResults.push({
          id: goal.id,
          type: 'goal',
          title: goal.title,
          subtitle: `Meta de ${formatCurrency(goal.target)}`,
          amount: formatCurrency(goal.saved),
          category: goal.category
        });
      }
    });

    setResults(searchResults.slice(0, 8));
    setIsOpen(true);
  }, [searchTerm, transactions, budgets, goals]);

  const close = () => {
    setIsOpen(false);
    setSearchTerm('');
    onNavigate?.();
  };

  const handleResultClick = (result) => {
    close();
    
    // Navegar dentro de la app (sin recargar); los movimientos llegan ya filtrados
    switch (result.type) {
      case 'transaction':
        navigate('/transactions', { state: { search: result.title } });
        break;
      case 'budget':
        navigate('/budget');
        break;
      case 'goal':
        navigate('/goals');
        break;
      default:
        break;
    }
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="control-icon">
        <Search aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar movimientos, metas…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && close()}
          className="control search-input"
          aria-label="Buscar"
        />
      </div>

      {isOpen && (
        <div className="search-results">
          <div className="search-results-header">
            <span>Resultados</span>
            <span className="num">{results.length}</span>
          </div>
          {results.length === 0 && (
            <p className="search-empty">Sin resultados para “{searchTerm.trim()}”</p>
          )}
          
          <div className="search-results-list">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                className="search-result-item"
                onClick={() => handleResultClick(result)}
              >
                <CategoryIcon category={result.category} />
                <div className="result-content">
                  <div className="result-title">{result.title}</div>
                  <div className="result-subtitle">{result.subtitle}</div>
                </div>
                <div className="result-amount num">
                  {result.amount}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
