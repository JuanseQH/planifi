// Funciones de utilidad para gráficos y visualizaciones

// Función para generar datos de gráfico de líneas
export const generateLineChartData = (transactions, period = 'month') => {
  // Si no hay transacciones, devolver datos de ejemplo
  if (!transactions || transactions.length === 0) {
    return {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Ingresos',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Gastos',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    };
  }

  const data = {};
  
  transactions.forEach(transaction => {
    let key;
    const date = new Date(transaction.date);
    
    switch (period) {
      case 'week':
        key = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = date.getFullYear().toString();
        break;
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (!data[key]) {
      data[key] = { income: 0, expenses: 0 };
    }
    
    if (transaction.type === 'income') {
      data[key].income += transaction.amount;
    } else {
      data[key].expenses += Math.abs(transaction.amount);
    }
  });
  
  const sortedData = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, values]) => ({
      period,
      income: values.income,
      expenses: values.expenses,
      balance: values.income - values.expenses
    }));

  // Si no hay datos, usar datos de ejemplo
  if (sortedData.length === 0) {
    return {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Ingresos',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Gastos',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    };
  }

  // Formato para Chart.js
  return {
    labels: sortedData.map(item => item.period),
    datasets: [
      {
        label: 'Ingresos',
        data: sortedData.map(item => item.income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false
      },
      {
        label: 'Gastos',
        data: sortedData.map(item => item.expenses),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: false
      }
    ]
  };
};

// Función para generar datos de gráfico de dona
export const generateDoughnutChartData = (transactions, type = 'category') => {
  // Si no hay transacciones, devolver datos de ejemplo
  if (!transactions || transactions.length === 0) {
    return {
      labels: ['Sin datos'],
      datasets: [{
        data: [1],
        backgroundColor: ['#6b7280'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  const data = {};
  
  transactions.forEach(transaction => {
    let key;
    
    if (type === 'category') {
      key = transaction.category;
    } else if (type === 'type') {
      key = transaction.type === 'income' ? 'Ingresos' : 'Gastos';
    }
    
    if (!data[key]) {
      data[key] = 0;
    }
    
    data[key] += Math.abs(transaction.amount);
  });
  
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  // Si no hay datos, usar datos de ejemplo
  if (Object.keys(data).length === 0) {
    return {
      labels: ['Sin datos'],
      datasets: [{
        data: [1],
        backgroundColor: ['#6b7280'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  // Formato para Chart.js
  return {
    labels: Object.keys(data),
    datasets: [{
      data: Object.values(data),
      backgroundColor: colors.slice(0, Object.keys(data).length),
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };
};

// Función para generar datos de gráfico de barras
export const generateBarChartData = (transactions, budgets) => {
  // Si no hay presupuestos, devolver datos de ejemplo
  if (!budgets || budgets.length === 0) {
    return {
      labels: ['Sin presupuestos'],
      datasets: [
        {
          label: 'Presupuesto',
          data: [0],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: '#3b82f6',
          borderWidth: 1
        },
        {
          label: 'Gastado',
          data: [0],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: '#ef4444',
          borderWidth: 1
        }
      ]
    };
  }

  const data = {};
  
  // Inicializar todas las categorías de presupuesto
  budgets.forEach(budget => {
    data[budget.category] = { 
      budget: budget.limit || 0, 
      spent: 0,
      remaining: budget.limit || 0
    };
  });
  
  // Agregar gastos por categoría
  if (transactions && transactions.length > 0) {
    transactions.forEach(transaction => {
      if (transaction.type === 'expense' && data[transaction.category]) {
        data[transaction.category].spent += Math.abs(transaction.amount);
        data[transaction.category].remaining = data[transaction.category].budget - data[transaction.category].spent;
      }
    });
  }

  const categories = Object.keys(data);
  
  // Formato para Chart.js
  return {
    labels: categories,
    datasets: [
      {
        label: 'Presupuesto',
        data: categories.map(cat => data[cat].budget),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 1
      },
      {
        label: 'Gastado',
        data: categories.map(cat => data[cat].spent),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#ef4444',
        borderWidth: 1
      }
    ]
  };
};

// Función para generar datos de gráfico de progreso de metas
export const generateGoalsProgressData = (goals) => {
  // Si no hay metas, devolver datos de ejemplo
  if (!goals || goals.length === 0) {
    return {
      labels: ['Sin metas'],
      datasets: [
        {
          label: 'Ahorrado',
          data: [0],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: '#10b981',
          borderWidth: 1
        },
        {
          label: 'Meta',
          data: [0],
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderDash: [5, 5]
        }
      ]
    };
  }

  const labels = goals.map(goal => goal.title);
  const saved = goals.map(goal => goal.saved);
  const target = goals.map(goal => goal.target);
  
  // Formato para Chart.js
  return {
    labels,
    datasets: [
      {
        label: 'Ahorrado',
        data: saved,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 1
      },
      {
        label: 'Meta',
        data: target,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderDash: [5, 5]
      }
    ]
  };
};

// Función para generar resumen financiero
export const generateFinancialSummary = (transactions, budgets, goals) => {
  const totalIncome = transactions && transactions.length > 0 ? 
    transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) : 0;
    
  const totalExpenses = transactions && transactions.length > 0 ? 
    transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0) : 0;
    
  const totalSavings = goals && goals.length > 0 ? goals.reduce((sum, goal) => sum + goal.saved, 0) : 0;
  const totalBudget = budgets && budgets.length > 0 ? budgets.reduce((sum, budget) => sum + budget.limit, 0) : 0;
  const totalSpent = budgets && budgets.length > 0 ? budgets.reduce((sum, budget) => sum + budget.spent, 0) : 0;
  
  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    totalBudget,
    totalSpent,
    balance: totalIncome - totalExpenses,
    savingsRate: totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0,
    budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  };
};

// Función para generar estadísticas de tendencias
export const generateTrendStats = (transactions, period = 'month') => {
  const currentData = generateLineChartData(transactions, period);
  
  if (currentData.datasets[0].data.length < 2) {
    return {
      incomeTrend: 0,
      expenseTrend: 0,
      balanceTrend: 0
    };
  }
  
  const incomeData = currentData.datasets[0].data;
  const expenseData = currentData.datasets[1].data;
  
  const currentIncome = incomeData[incomeData.length - 1] || 0;
  const previousIncome = incomeData[incomeData.length - 2] || 0;
  const currentExpense = expenseData[expenseData.length - 1] || 0;
  const previousExpense = expenseData[expenseData.length - 2] || 0;
  
  const incomeTrend = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
  const expenseTrend = previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0;
  const balanceTrend = ((currentIncome - currentExpense) - (previousIncome - previousExpense)) / Math.max(previousIncome - previousExpense, 1) * 100;
  
  return {
    incomeTrend,
    expenseTrend,
    balanceTrend
  };
};

// Función para generar opciones de gráfico
export const generateChartOptions = (type, title = '') => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12
      }
    }
  };

  switch (type) {
    case 'line':
      return {
        ...baseOptions,
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 11
              }
            }
          }
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6
          },
          line: {
            tension: 0.4
          }
        }
      };
      
    case 'doughnut':
      return {
        ...baseOptions,
        cutout: '60%',
        plugins: {
          ...baseOptions.plugins,
          legend: {
            ...baseOptions.plugins.legend,
            position: 'bottom'
          }
        }
      };
      
    case 'bar':
      return {
        ...baseOptions,
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 11
              }
            }
          }
        }
      };
      
    default:
      return baseOptions;
  }
};

