import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import Equipment from './components/Equipment';
import Employees from './components/Employees';
import Allocations from './components/Allocations';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [toasts, setToasts] = useState([]);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      // Alt/Option + number keys for navigation
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            changeTab('dashboard');
            break;
          case '2':
            e.preventDefault();
            changeTab('equipment');
            break;
          case '3':
            e.preventDefault();
            changeTab('employees');
            break;
          case '4':
            e.preventDefault();
            changeTab('allocations');
            break;
          case 'd':
            e.preventDefault();
            toggleTheme();
            break;
          case 'k':
            e.preventDefault();
            setShowKeyboardHints(prev => !prev);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [theme]);

  const changeTab = useCallback((tab) => {
    if (tab === activeTab) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  }, [activeTab]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Show toast notification
    showToast('success', 'Theme Changed', `Switched to ${newTheme} mode`, false);
  };

  const showToast = useCallback((type, title, message, autoClose = true) => {
    const id = Date.now();
    const newToast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    // Auto remove after 3 seconds if autoClose is true
    if (autoClose) {
      setTimeout(() => {
        removeToast(id);
      }, 3000);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const renderContent = () => {
    const content = (() => {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard showToast={showToast} />;
        case 'equipment':
          return <Equipment showToast={showToast} />;
        case 'employees':
          return <Employees showToast={showToast} />;
        case 'allocations':
          return <Allocations showToast={showToast} />;
        default:
          return <Dashboard showToast={showToast} />;
      }
    })();

    return (
      <div className={`page-content ${isTransitioning ? 'page-exit-active' : 'page-enter-active'}`}>
        {content}
      </div>
    );
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🎯 EquipTrack</h1>
          <p className="subtitle">Remote Employee Equipment Allocation & Asset Tracking</p>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-button ripple ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => changeTab('dashboard')}
          aria-label="Dashboard (Alt+1)"
          title="Dashboard (Alt+1)"
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-button ripple ${activeTab === 'equipment' ? 'active' : ''}`}
          onClick={() => changeTab('equipment')}
          aria-label="Equipment (Alt+2)"
          title="Equipment (Alt+2)"
        >
          💻 Equipment
        </button>
        <button
          className={`nav-button ripple ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => changeTab('employees')}
          aria-label="Employees (Alt+3)"
          title="Employees (Alt+3)"
        >
          👥 Employees
        </button>
        <button
          className={`nav-button ripple ${activeTab === 'allocations' ? 'active' : ''}`}
          onClick={() => changeTab('allocations')}
          aria-label="Allocations (Alt+4)"
          title="Allocations (Alt+4)"
        >
          🔄 Allocations
        </button>
      </nav>

      <main className="app-main">
        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>© 2026 EquipTrack - Modern Asset Management System</p>
      </footer>

      {/* Dark Mode Toggle */}
      <button 
        className="theme-toggle ripple" 
        onClick={toggleTheme}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode (Alt+D)`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Keyboard Shortcuts Hint */}
      {showKeyboardHints && (
        <div className="keyboard-shortcuts-hint">
          <strong>⌨️ Keyboard Shortcuts</strong>
          <div className="shortcut-item">
            <span>Dashboard</span>
            <kbd>Alt + 1</kbd>
          </div>
          <div className="shortcut-item">
            <span>Equipment</span>
            <kbd>Alt + 2</kbd>
          </div>
          <div className="shortcut-item">
            <span>Employees</span>
            <kbd>Alt + 3</kbd>
          </div>
          <div className="shortcut-item">
            <span>Allocations</span>
            <kbd>Alt + 4</kbd>
          </div>
          <div className="shortcut-item">
            <span>Toggle Theme</span>
            <kbd>Alt + D</kbd>
          </div>
          <div className="shortcut-item">
            <span>Show/Hide This</span>
            <kbd>Alt + K</kbd>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-icon">{getToastIcon(toast.type)}</div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button 
              className="toast-close" 
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            >
              ✖
            </button>
            <div className="toast-progress"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
