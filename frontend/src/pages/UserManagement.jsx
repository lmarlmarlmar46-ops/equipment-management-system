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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>👥 User Management</h1>
        <p>Manage user roles and permissions</p>
      </div>

      <div className="users-table">
        <table>
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
                <td>
                  <strong>{u.username}</strong>
                  {u.id === user.id && <span className="badge-you">You</span>}
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${u.status}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  {u.last_login 
                    ? new Date(u.last_login).toLocaleDateString()
                    : 'Never'
                  }
                </td>
                <td>
                  {u.id !== user.id && (
                    <div className="action-buttons">
                      {u.role !== 'admin' && (
                        <button
                          className="btn-promote"
                          onClick={() => handlePromote(u.id, u.role)}
                          disabled={promoting === u.id}
                        >
                          {promoting === u.id ? 'Processing...' : '⬆️ Promote'}
                        </button>
                      )}
                      {u.role !== 'employee' && (
                        <button
                          className="btn-demote"
                          onClick={() => handleDemote(u.id, u.role)}
                          disabled={promoting === u.id}
                        >
                          {promoting === u.id ? 'Processing...' : '⬇️ Demote'}
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

      <div className="info-box">
        <h3>ℹ️ Role Permissions</h3>
        <ul>
          <li><strong>Employee:</strong> Can request equipment, view own equipment, track requests</li>
          <li><strong>Manager:</strong> Can approve requests, issue equipment, manage allocations + employee permissions</li>
          <li><strong>Admin:</strong> Full system access, can promote users, manage all data</li>
        </ul>
      </div>
    </div>
  );
};

export default UserManagement;
