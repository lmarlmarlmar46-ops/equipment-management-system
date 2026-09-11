import { useState, useEffect } from 'react';
import { workAssignmentsAPI, authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './WorkAssignments.css';

function WorkAssignments() {
  const { user } = useAuth();
  const userRole = user?.role;
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    assigned_to: '',
    task_description: '',
    department: '',
    location: '',
    priority: 'medium',
    due_date: '',
    notes: ''
  });

  const isManagerOrAdmin = ['admin', 'manager'].includes(userRole);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      
      // Fetch assignments and users (not employees)
      const assignmentsPromise = workAssignmentsAPI.getAll(params);
      const usersPromise = isManagerOrAdmin 
        ? authAPI.getCurrentUser().then(() => api.get('/auth/users'))
        : Promise.resolve({ data: { users: [] } });

      const [assignmentsRes, usersRes] = await Promise.all([
        assignmentsPromise,
        usersPromise
      ]);
      
      setAssignments(assignmentsRes.data);
      if (isManagerOrAdmin) {
        // Map users to look like employees
        const usersList = usersRes.data.users || [];
        const mappedUsers = usersList.map(u => ({
          id: u.id,
          full_name: u.username,
          email: u.email,
          phone: u.phone || 'N/A',
          department: u.department || 'N/A',
          available: u.status === 'active' ? 1 : 0
        }));
        setEmployees(mappedUsers);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWork = async (e) => {
    e.preventDefault();
    try {
      await workAssignmentsAPI.create(formData);
      setShowAssignModal(false);
      setFormData({
        assigned_to: '',
        task_description: '',
        department: '',
        location: '',
        priority: 'medium',
        due_date: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert(error.response?.data?.error || 'Failed to create assignment');
    }
  };

  const handleStatusUpdate = async (assignmentId, status, rejectionReason = null) => {
    try {
      await workAssignmentsAPI.updateStatus(assignmentId, {
        status,
        rejection_reason: rejectionReason
      });
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleAccept = (assignmentId) => {
    handleStatusUpdate(assignmentId, 'accepted');
  };

  const handleReject = (assignmentId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      handleStatusUpdate(assignmentId, 'rejected', reason);
    }
  };

  const handleComplete = (assignmentId) => {
    if (confirm('Mark this assignment as completed?')) {
      handleStatusUpdate(assignmentId, 'completed');
    }
  };

  const handleContact = (employee, method) => {
    if (method === 'email') {
      window.location.href = `mailto:${employee.employee_email}`;
    } else if (method === 'phone' && employee.employee_phone) {
      window.location.href = `tel:${employee.employee_phone}`;
    }
  };

  const openAssignModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData(prev => ({
      ...prev,
      assigned_to: employee.id,
      department: employee.department || ''
    }));
    setShowAssignModal(true);
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'badge-success',
      medium: 'badge-warning',
      high: 'badge-danger',
      urgent: 'badge-critical'
    };
    return badges[priority] || 'badge-secondary';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      accepted: 'badge-info',
      in_progress: 'badge-primary',
      completed: 'badge-success',
      rejected: 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="work-assignments-container">
      <div className="page-header">
        <div>
          <h1>
            <svg className="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Work Assignments
          </h1>
          <p className="subtitle">
            {isManagerOrAdmin 
              ? 'Assign tasks to employees and track progress'
              : 'View and manage your work assignments'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-tabs">
          {['all', 'pending', 'accepted', 'in_progress', 'completed', 'rejected'].map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.replace('_', ' ')}
              <span className="count">
                {status === 'all' 
                  ? assignments.length 
                  : assignments.filter(a => a.status === status).length
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Manager/Admin View - Employee List with Assign Button */}
      {isManagerOrAdmin && (
        <div className="section">
          <h2 className="section-title">Available Employees</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => (
                  <tr key={employee.id}>
                    <td data-label="Employee">
                      <div className="employee-info">
                        <strong>{employee.full_name}</strong>
                      </div>
                    </td>
                    <td data-label="Email">{employee.email}</td>
                    <td data-label="Phone">{employee.phone || 'N/A'}</td>
                    <td data-label="Department">{employee.department || 'N/A'}</td>
                    <td data-label="Status">
                      <span className={`badge ${employee.available ? 'badge-success' : 'badge-secondary'}`}>
                        {employee.available ? 'Available' : 'Busy'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="action-buttons">
                        <button
                          className="btn-sm btn-primary"
                          onClick={() => openAssignModal(employee)}
                        >
                          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Assign Work
                        </button>
                        <button
                          className="btn-sm btn-secondary"
                          onClick={() => handleContact(employee, 'email')}
                        >
                          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                          </svg>
                        </button>
                        {employee.phone && (
                          <button
                            className="btn-sm btn-secondary"
                            onClick={() => handleContact(employee, 'phone')}
                          >
                            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="section">
        <h2 className="section-title">
          {isManagerOrAdmin ? 'All Assignments' : 'My Assignments'}
        </h2>
        {assignments.length === 0 ? (
          <div className="empty-state">
            <svg className="icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p>No assignments found</p>
          </div>
        ) : (
          <div className="assignments-grid">
            {assignments.map(assignment => (
              <div key={assignment.id} className="assignment-card">
                <div className="assignment-header">
                  <div>
                    <span className={`badge ${getStatusBadge(assignment.status)}`}>
                      {assignment.status}
                    </span>
                    <span className={`badge ${getPriorityBadge(assignment.priority)}`}>
                      {assignment.priority}
                    </span>
                  </div>
                  <small className="text-muted">
                    {new Date(assignment.created_at).toLocaleDateString()}
                  </small>
                </div>

                <div className="assignment-body">
                  <h3>{assignment.task_description}</h3>
                  
                  <div className="assignment-details">
                    {assignment.employee_name && (
                      <div className="detail-row">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span><strong>Assigned to:</strong> {assignment.employee_name}</span>
                      </div>
                    )}
                    
                    {assignment.department && (
                      <div className="detail-row">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        <span><strong>Department:</strong> {assignment.department}</span>
                      </div>
                    )}
                    
                    {assignment.location && (
                      <div className="detail-row">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span><strong>Location:</strong> {assignment.location}</span>
                      </div>
                    )}
                    
                    {assignment.due_date && (
                      <div className="detail-row">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span><strong>Due:</strong> {new Date(assignment.due_date).toLocaleDateString()}</span>
                      </div>
                    )}

                    {assignment.notes && (
                      <div className="detail-row notes">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span>{assignment.notes}</span>
                      </div>
                    )}

                    {assignment.rejection_reason && (
                      <div className="detail-row rejection">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span><strong>Rejection reason:</strong> {assignment.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Employee Actions */}
                {!isManagerOrAdmin && assignment.status === 'pending' && (
                  <div className="assignment-actions">
                    <button
                      className="btn-sm btn-success"
                      onClick={() => handleAccept(assignment.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => handleReject(assignment.id)}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {!isManagerOrAdmin && assignment.status === 'accepted' && (
                  <div className="assignment-actions">
                    <button
                      className="btn-sm btn-primary"
                      onClick={() => handleStatusUpdate(assignment.id, 'in_progress')}
                    >
                      Start Work
                    </button>
                  </div>
                )}

                {!isManagerOrAdmin && assignment.status === 'in_progress' && (
                  <div className="assignment-actions">
                    <button
                      className="btn-sm btn-success"
                      onClick={() => handleComplete(assignment.id)}
                    >
                      Mark Complete
                    </button>
                  </div>
                )}

                {/* Manager Contact Options */}
                {isManagerOrAdmin && assignment.employee_email && (
                  <div className="assignment-actions">
                    <button
                      className="btn-sm btn-secondary"
                      onClick={() => window.location.href = `mailto:${assignment.employee_email}`}
                    >
                      Email Employee
                    </button>
                    {assignment.employee_phone && (
                      <button
                        className="btn-sm btn-secondary"
                        onClick={() => window.location.href = `tel:${assignment.employee_phone}`}
                      >
                        Call Employee
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Work Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Work to {selectedEmployee?.full_name}</h2>
              <button className="btn-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAssignWork}>
              <div className="form-group">
                <label>Task Description *</label>
                <textarea
                  value={formData.task_description}
                  onChange={e => setFormData({...formData, task_description: e.target.value})}
                  required
                  rows="3"
                  placeholder="Describe the work to be done..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    placeholder="e.g., IT, HR, Sales"
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Building A, Floor 3"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={e => setFormData({...formData, due_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  rows="2"
                  placeholder="Any additional information..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Assign Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkAssignments;
