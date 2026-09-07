import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.username}!`);
      
      // Redirect based on role
      if (result.user.role === 'admin' || result.user.role === 'manager') {
        navigate('/it-dashboard');
      } else {
        navigate('/my-equipment');
      }
    } else {
      toast.error(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="card" style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
        <div className="card-body" style={{ padding: 'var(--space-8)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--brand-primary)' }}>
                <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="heading-3" style={{ color: 'var(--brand-primary)', margin: 0 }}>EquipTrack</span>
            </div>
            <h1 className="heading-2" style={{ marginBottom: 'var(--space-2)' }}>Welcome Back</h1>
            <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
              Sign in to manage equipment and allocations
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="form-group">
              <label htmlFor="email" className="form-label is-required">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label is-required">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-input"
                  style={{ paddingRight: 'var(--space-10)' }}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: 'absolute',
                    right: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: 'var(--space-2)',
                    cursor: 'pointer',
                    color: 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color var(--duration-base) var(--ease-out)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className={`btn btn-primary btn-lg ${loading ? 'is-loading' : ''}`} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-primary)' }}>
            <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: '500' }}>
                Create one
              </Link>
            </p>
          </div>

          <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
            <h3 className="heading-6" style={{ marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>Demo Accounts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div className="caption" style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span className="badge badge-error" style={{ fontSize: 'var(--text-xs)' }}>Admin</span>
                <code style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>admin@equiptrack.com / admin123</code>
              </div>
              <div className="caption" style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span className="badge badge-warning" style={{ fontSize: 'var(--text-xs)' }}>Manager</span>
                <code style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>manager@equiptrack.com / manager123</code>
              </div>
              <div className="caption" style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span className="badge badge-info" style={{ fontSize: 'var(--text-xs)' }}>Employee</span>
                <code style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>employee@equiptrack.com / employee123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
