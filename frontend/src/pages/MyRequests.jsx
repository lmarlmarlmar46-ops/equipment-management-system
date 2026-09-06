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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="employee-portal">
      <div className="portal-header">
        <div>
          <h1>📋 My Equipment Requests</h1>
          <p>Track the status of your equipment requests</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/request-equipment')}>
          ➕ New Request
        </button>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Requests ({requests.length})
        </button>
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({requests.filter(r => ['pending', 'assigned', 'in_progress'].includes(r.status)).length})
        </button>
        <button
          className={`filter-tab ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Resolved ({requests.filter(r => ['resolved', 'rejected'].includes(r.status)).length})
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <p>📭 No requests found</p>
          <small>
            {filter === 'all' 
              ? 'You haven\'t submitted any equipment requests yet'
              : `No ${filter} requests`
            }
          </small>
          <button className="btn-primary" onClick={() => navigate('/request-equipment')}>
            Submit Your First Request
          </button>
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map(request => {
            const statusBadge = getStatusBadge(request.status);
            return (
              <div key={request.id} className="request-card">
                <div className="request-card-header">
                  <div>
                    <h3>{request.issue_type === 'equipment_request' ? '🖥️ Equipment Request' : request.issue_type}</h3>
                    <span
                      className="priority-dot"
                      style={{ backgroundColor: getPriorityColor(request.priority) }}
                      title={`Priority: ${request.priority}`}
                    ></span>
                  </div>
                  <span className={`status-badge ${statusBadge.class}`}>
                    {statusBadge.icon} {statusBadge.text}
                  </span>
                </div>

                <div className="request-card-body">
                  <div className="request-description">
                    {request.description}
                  </div>

                  {request.resolution && (
                    <div className="request-resolution">
                      <strong>Resolution:</strong>
                      <p>{request.resolution}</p>
                    </div>
                  )}
                </div>

                <div className="request-card-footer">
                  <small>
                    Submitted: {format(new Date(request.created_at), 'MMM dd, yyyy')}
                  </small>
                  {request.resolved_at && (
                    <small>
                      Resolved: {format(new Date(request.resolved_at), 'MMM dd, yyyy')}
                    </small>
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
