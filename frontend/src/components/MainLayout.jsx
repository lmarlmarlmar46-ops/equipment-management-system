import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const [theme, setTheme] = useState('light');
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();

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

      // Alt/Option + key shortcuts
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            navigate('/dashboard');
            break;
          case '2':
            e.preventDefault();
            navigate('/equipment');
            break;
          case '3':
            e.preventDefault();
            navigate('/employees');
            break;
          case '4':
            e.preventDefault();
            navigate('/allocations');
            break;
          case '5':
            e.preventDefault();
            if (isManager()) navigate('/it-dashboard');
            break;
          case '6':
            e.preventDefault();
            navigate('/my-equipment');
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
  }, [navigate, isManager]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">📦</span>
            <div>
              <h1>EquipTrack</h1>
              <p className="subtitle">IT Asset Management</p>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="user-info" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.username}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              <span className="dropdown-icon">▼</span>
              
              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <strong>{user?.username}</strong>
                    <small>{user?.email}</small>
                  </div>
                  <button onClick={handleLogout} className="user-menu-item">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <NavLink to="/dashboard" className="nav-button ripple">
          📊 Dashboard
        </NavLink>
        <NavLink to="/equipment" className="nav-button ripple">
          💻 Equipment
        </NavLink>
        <NavLink to="/employees" className="nav-button ripple">
          👥 Employees
        </NavLink>
        <NavLink to="/allocations" className="nav-button ripple">
          🔄 Allocations
        </NavLink>
        
        {isManager() && (
          <>
            <NavLink to="/it-dashboard" className="nav-button ripple nav-button-highlight">
              🔧 IT Operations
            </NavLink>
            <NavLink to="/users" className="nav-button ripple nav-button-highlight">
              👥 Users
            </NavLink>
          </>
        )}
        
        <NavLink to="/my-equipment" className="nav-button ripple">
          📦 My Equipment
        </NavLink>
        <NavLink to="/request-equipment" className="nav-button ripple nav-button-secondary">
          ➕ Request
        </NavLink>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>© 2026 EquipTrack - IT Asset Management System</p>
      </footer>

      {/* Dark Mode Toggle */}
      <button 
        className="theme-toggle ripple" 
        onClick={toggleTheme}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode (Alt+D)`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Keyboard Shortcuts Hint */}
      <button
        className="keyboard-hint-toggle"
        onClick={() => setShowKeyboardHints(!showKeyboardHints)}
        title="Show keyboard shortcuts (Alt+K)"
      >
        ⌨️
      </button>

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
          {isManager() && (
            <div className="shortcut-item">
              <span>IT Operations</span>
              <kbd>Alt + 5</kbd>
            </div>
          )}
          <div className="shortcut-item">
            <span>My Equipment</span>
            <kbd>Alt + 6</kbd>
          </div>
          <div className="shortcut-item">
            <span>Toggle Theme</span>
            <kbd>Alt + D</kbd>
          </div>
          <div className="shortcut-item">
            <span>Toggle This Help</span>
            <kbd>Alt + K</kbd>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
