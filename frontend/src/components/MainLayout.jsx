import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
            </svg>
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
              <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              
              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <strong>{user?.username}</strong>
                    <small>{user?.email}</small>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigate('/profile'); setShowUserMenu(false); }} className="user-menu-item">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Profile Settings
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="user-menu-item">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <NavLink to="/dashboard" className="nav-button ripple">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Dashboard
        </NavLink>
        <NavLink to="/equipment" className="nav-button ripple">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="14" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Equipment
        </NavLink>
        <NavLink to="/employees" className="nav-button ripple">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 21V19C3 17.3431 4.34315 16 6 16H12C13.6569 16 15 17.3431 15 19V21M16 11L18 13L22 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Employees
        </NavLink>
        <NavLink to="/allocations" className="nav-button ripple">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12C21 16.9706 16.9706 21 12 21M21 12C21 7.02944 16.9706 3 12 3M21 12H3M12 21C7.02944 21 3 16.9706 3 12M12 21C13.6569 21 15 16.9706 15 12C15 7.02944 13.6569 3 12 3M12 21C10.3431 21 9 16.9706 9 12C9 7.02944 10.3431 3 12 3M3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Allocations
        </NavLink>
        
        {isManager() && (
          <>
            <NavLink to="/it-dashboard" className="nav-button ripple nav-button-highlight">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              IT Operations
            </NavLink>
            <NavLink to="/users" className="nav-button ripple nav-button-highlight">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Users
            </NavLink>
          </>
        )}
        
        <NavLink to="/my-equipment" className="nav-button ripple">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          My Equipment
        </NavLink>
        <NavLink to="/request-equipment" className="nav-button ripple nav-button-secondary">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Request
        </NavLink>
        <NavLink to="/contacts" className="nav-button ripple">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Contacts
        </NavLink>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>© 2026 EquipTrack - IT Asset Management System</p>
      </footer>

      <button
        className="keyboard-hint-toggle"
        onClick={() => setShowKeyboardHints(!showKeyboardHints)}
        title="Show keyboard shortcuts (Alt+K)"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="6" y1="8" x2="6.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="10" y1="8" x2="10.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="14" y1="8" x2="14.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="18" y1="8" x2="18.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {showKeyboardHints && (
        <div className="keyboard-shortcuts-hint">
          <div className="shortcuts-header">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <strong>Keyboard Shortcuts</strong>
          </div>
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
            <span>Toggle This Help</span>
            <kbd>Alt + K</kbd>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
