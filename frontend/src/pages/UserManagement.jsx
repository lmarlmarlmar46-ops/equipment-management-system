import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(null);
  const { user, isManager, isAdmin } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId, currentRole) => {
    // Determine next role
    let newRole;
    if (currentRole === 'employee') {
      newRole = 'manager';
    } else if (currentRole === 'manager') {
      if (!isAdmin()) {
        toast.error('Only admins can promote to admin role');
        return;
      }
      newRole = 'admin';
    } else {
      toast.info('User is already an admin');
      return;
    }

    if (!window.confirm(`Promote this user to ${newRole}?`)) {
      return;
    }

    setPromoting(userId);

    try {
      await api.post('/auth/promote', {
        user_id: userId,
        new_role: newRole
      });

      toast.success(`User promoted to ${newRole}!`);
      loadUsers(); // Reload list
    } catch (error) {
      console.error('Failed to promote user:', error);
      toast.error(error.response?.data?.error || 'Failed to promote user');
    } finally {
      setPromoting(null);
    }
  };

  const handleDemote = async (userId, currentRole) => {
    // Determine demotion role
    let newRole;
    if (currentRole === 'admin') {
      newRole = 'manager';
    } else if (currentRole === 'manager') {
      newRole = 'employee';
    } else {
      toast.info('User is already an employee');
      return;
    }

    if (!window.confirm(`Demote this user to ${newRole}?`)) {
      return;
    }

    setPromoting(userId);

    try {
      await api.post('/auth/promote', {
        user_id: userId,
        new_role: newRole
      });

      toast.success(`User demoted to ${newRole}`);
      loadUsers();
    } catch (error) {
      console.error('Failed to demote user:', error);
      toast.error(error.response?.data?.error || 'Failed to demote user');
    } finally {
      setPromoting(null);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-admin';
      case 'manager':
        return 'role-manager';
      default:
        return 'role-employee';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 'var(--space-4)' }}>
        <div className="loading-spinner"></div>
        <p className="body-base" style={{ color: 'var(--text-secondary)' }}>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="heading-2">User Management</h1>
            <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
              Manage user roles and permissions
            </p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td data-label="Username">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <strong>{u.username}</strong>
                      {u.id === user.id && <span className="badge badge-info" style={{ fontSize: 'var(--text-xs)' }}>You</span>}
                    </div>
                  </td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Role">
                    <span className={`badge ${
                      u.role === 'admin' ? 'badge-error' :
                      u.role === 'manager' ? 'badge-warning' :
                      'badge-info'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td data-label="Last Login">
                    <span className="body-sm">
                      {u.last_login 
                        ? new Date(u.last_login).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </td>
                  <td data-label="Actions">
                    {u.id !== user.id && (
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {u.role !== 'admin' && (
                          <button
                            className={`btn btn-sm btn-success ${promoting === u.id ? 'is-loading' : ''}`}
                            onClick={() => handlePromote(u.id, u.role)}
                            disabled={promoting === u.id}
                          >
                            {promoting === u.id ? 'Processing...' : 'Promote'}
                          </button>
                        )}
                        {u.role !== 'employee' && (
                          <button
                            className={`btn btn-sm btn-secondary ${promoting === u.id ? 'is-loading' : ''}`}
                            onClick={() => handleDemote(u.id, u.role)}
                            disabled={promoting === u.id}
                          >
                            {promoting === u.id ? 'Processing...' : 'Demote'}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-6)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
        <div className="card-header">
          <h3 className="card-header-title">Role Permissions</h3>
        </div>
        <div className="card-body">
          <ul style={{ margin: 0, padding: '0 0 0 var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li className="body-sm"><strong>Employee:</strong> Can request equipment, view own equipment, track requests</li>
            <li className="body-sm"><strong>Manager:</strong> Can approve requests, issue equipment, manage allocations + employee permissions</li>
            <li className="body-sm"><strong>Admin:</strong> Full system access, can promote users, manage all data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
