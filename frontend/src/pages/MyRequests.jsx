import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceRequestsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import '../styles/EmployeePortal.css';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, resolved
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      // Get requests for current user's employee_id
      const response = await serviceRequestsAPI.getAll({
        employee_id: user?.employee_id
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to load requests:', error);
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: '⏳', text: 'Pending Review', class: 'status-pending' },
      assigned: { icon: '👤', text: 'Assigned', class: 'status-assigned' },
      in_progress: { icon: '🔄', text: 'In Progress', class: 'status-progress' },
      resolved: { icon: '✅', text: 'Resolved', class: 'status-resolved' },
      rejected: { icon: '❌', text: 'Rejected', class: 'status-rejected' }
    };
    return badges[status] || badges.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#e74c3c',
      high: '#f39c12',
      medium: '#3498db',
      low: '#95a5a6'
    };
    return colors[priority] || colors.medium;
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    if (filter === 'pending') return request.status === 'pending' || request.status === 'assigned' || request.status === 'in_progress';
    if (filter === 'resolved') return request.status === 'resolved' || request.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 'var(--space-4)' }}>
        <div className="loading-spinner"></div>
        <p className="body-base" style={{ color: 'var(--text-secondary)' }}>Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="employee-portal">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="heading-2">My Equipment Requests</h1>
            <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
              Track the status of your equipment requests
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/request-equipment')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            className={`btn btn-tertiary ${filter === 'all' ? 'is-active' : ''}`}
            style={{ 
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              borderBottom: filter === 'all' ? '2px solid var(--brand-primary)' : 'none',
              background: filter === 'all' ? 'var(--bg-secondary)' : 'transparent'
            }}
            onClick={() => setFilter('all')}
          >
            All Requests ({requests.length})
          </button>
          <button
            className={`btn btn-tertiary ${filter === 'pending' ? 'is-active' : ''}`}
            style={{ 
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              borderBottom: filter === 'pending' ? '2px solid var(--brand-primary)' : 'none',
              background: filter === 'pending' ? 'var(--bg-secondary)' : 'transparent'
            }}
            onClick={() => setFilter('pending')}
          >
            Pending ({requests.filter(r => ['pending', 'assigned', 'in_progress'].includes(r.status)).length})
          </button>
          <button
            className={`btn btn-tertiary ${filter === 'resolved' ? 'is-active' : ''}`}
            style={{ 
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              borderBottom: filter === 'resolved' ? '2px solid var(--brand-primary)' : 'none',
              background: filter === 'resolved' ? 'var(--bg-secondary)' : 'transparent'
            }}
            onClick={() => setFilter('resolved')}
          >
            Resolved ({requests.filter(r => ['resolved', 'rejected'].includes(r.status)).length})
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4)' }}>
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className="heading-4" style={{ marginBottom: 'var(--space-2)' }}>No requests found</h3>
            <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              {filter === 'all' 
                ? 'You haven\'t submitted any equipment requests yet'
                : `No ${filter} requests`
              }
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/request-equipment')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Submit Your First Request
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-4)' }}>
          {filteredRequests.map(request => {
            const statusBadge = getStatusBadge(request.status);
            return (
              <div key={request.id} className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <h3 className="card-header-title" style={{ fontSize: 'var(--text-base)' }}>
                      {request.issue_type === 'equipment_request' ? 'Equipment Request' : request.issue_type}
                    </h3>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getPriorityColor(request.priority),
                        flexShrink: 0
                      }}
                      title={`Priority: ${request.priority}`}
                    ></span>
                  </div>
                  <span className={`badge ${
                    request.status === 'resolved' ? 'badge-success' :
                    request.status === 'rejected' ? 'badge-error' :
                    request.status === 'in_progress' ? 'badge-info' :
                    'badge-warning'
                  }`}>
                    {statusBadge.text}
                  </span>
                </div>

                <div className="card-body">
                  <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    {request.description}
                  </p>

                  {request.resolution && (
                    <div style={{ padding: 'var(--space-3)', background: 'var(--success-alpha)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-4)' }}>
                      <strong className="caption" style={{ color: 'var(--success)', display: 'block', marginBottom: 'var(--space-1)' }}>Resolution</strong>
                      <p className="body-sm">{request.resolution}</p>
                    </div>
                  )}
                </div>

                <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="caption" style={{ color: 'var(--text-tertiary)' }}>
                    Submitted: {format(new Date(request.created_at), 'MMM dd, yyyy')}
                  </span>
                  {request.resolved_at && (
                    <span className="caption" style={{ color: 'var(--text-tertiary)' }}>
                      Resolved: {format(new Date(request.resolved_at), 'MMM dd, yyyy')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
