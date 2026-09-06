import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Equipment from './components/Equipment';
import Employees from './components/Employees';
import Allocations from './components/Allocations';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Show toast notification
    showToast('success', 'Theme Changed', `Switched to ${newTheme} mode`);
  };

  const showToast = (type, title, message) => {
    const id = Date.now();
    const newToast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'equipment':
        return <Equipment />;
      case 'employees':
        return <Employees />;
      case 'allocations':
        return <Allocations />;
      default:
        return <Dashboard />;
    }
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
          className={activeTab === 'dashboard' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={activeTab === 'equipment' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('equipment')}
        >
          💻 Equipment
        </button>
        <button
          className={activeTab === 'employees' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('employees')}
        >
          👥 Employees
        </button>
        <button
          className={activeTab === 'allocations' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveTab('allocations')}
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
        className="theme-toggle" 
        onClick={toggleTheme}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

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
