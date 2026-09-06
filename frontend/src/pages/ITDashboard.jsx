import { useState, useEffect } from 'react';
import { workflowAPI, allocationsAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import '../styles/ITDashboard.css';

const ITDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeAllocations, setActiveAllocations] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approving, setApproving] = useState(false);
  const [processingReturn, setProcessingReturn] = useState(null);
  const [activeTab, setActiveTab] = useState('requests'); // requests, allocations, returns

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load workflow stats
      const statsRes = await workflowAPI.getDashboardOverview();
      setStats(statsRes.data);

      // Load pending requests
      const requestsRes = await workflowAPI.getPendingRequests();
      setPendingRequests(requestsRes.data);

      // Load active allocations
      const allocationsRes = await allocationsAPI.getActive();
      setActiveAllocations(allocationsRes.data);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndAllocate = async (request, equipmentId) => {
    if (!equipmentId) {
      toast.error('Please select equipment to allocate');
      return;
    }

    setApproving(true);

    try {
      const expectedReturnDate = new Date();
      expectedReturnDate.setMonth(expectedReturnDate.getMonth() + 6); // 6 months default

      await workflowAPI.approveAndAllocate({
        service_request_id: request.id,
        equipment_id: equipmentId,
        expected_return_date: expectedReturnDate.toISOString().split('T')[0],
        notes: `Approved and issued. Employee signed return agreement.`
      });

      toast.success(`Equipment allocated to ${request.employee_name}`);
      loadDashboardData(); // Reload data
      setSelectedRequest(null);

    } catch (error) {
      console.error('Failed to approve and allocate:', error);
      toast.error(error.response?.data?.error || 'Failed to approve request');
    } finally {
      setApproving(false);
    }
  };

  const handleProcessReturn = async (allocation, requiresMaintenance = false) => {
    setProcessingReturn(allocation.id);

    try {
      await workflowAPI.processReturn({
        allocation_id: allocation.id,
        condition_notes: requiresMaintenance 
          ? 'Equipment requires maintenance before next allocation' 
          : 'Equipment returned in good condition',
        requires_maintenance: requiresMaintenance
      });

      toast.success('Return processed successfully');
      loadDashboardData();

    } catch (error) {
      console.error('Failed to process return:', error);
      toast.error(error.response?.data?.error || 'Failed to process return');
    } finally {
      setProcessingReturn(null);
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      critical: '🔴 Critical',
      high: '🟠 High',
      medium: '🟡 Medium',
      low: '🟢 Low'
    };
    return badges[priority] || badges.medium;
  };

  const isOverdue = (expectedReturnDate) => {
    return new Date(expectedReturnDate) < new Date();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading IT Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="it-dashboard">
      <div className="dashboard-header">
        <h1>🔧 IT Operations Dashboard</h1>
        <p>Manage equipment requests, allocations, and returns</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card stat-pending">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Pending Requests</h3>
            <p className="stat-value">{stats?.pending_requests || 0}</p>
          </div>
        </div>

        <div className="stat-card stat-active">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>Active Allocations</h3>
            <p className="stat-value">{stats?.active_allocations || 0}</p>
          </div>
        </div>

        <div className="stat-card stat-overdue">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Overdue Returns</h3>
            <p className="stat-value">{stats?.overdue_count || 0}</p>
          </div>
        </div>

        <div className="stat-card stat-returns">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Returns Pending</h3>
            <p className="stat-value">{stats?.returns_pending || 0}</p>
          </div>
        </div>

        <div className="stat-card stat-available">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Available Equipment</h3>
            <p className="stat-value">{stats?.available_equipment || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          📋 Pending Requests ({pendingRequests.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'allocations' ? 'active' : ''}`}
          onClick={() => setActiveTab('allocations')}
        >
          🔄 Active Allocations ({activeAllocations.length})
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'requests' && (
          <div className="requests-section">
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <p>✅ No pending requests</p>
                <small>All equipment requests have been processed</small>
              </div>
            ) : (
              <div className="requests-list">
                {pendingRequests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <div>
                        <h3>{request.employee_name}</h3>
                        <p className="request-department">{request.department}</p>
                        <p className="request-email">{request.employee_email}</p>
                      </div>
                      <span className="priority-badge">
                        {getPriorityBadge(request.priority)}
                      </span>
                    </div>

                    <div className="request-details">
                      <p><strong>Equipment Type:</strong> {request.equipment_type}</p>
                      <p><strong>Request Details:</strong></p>
                      <div className="request-description">
                        {request.description}
                      </div>
                      <p className="request-date">
                        Submitted: {format(new Date(request.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>

                    {request.available_equipment && request.available_equipment.length > 0 && (
                      <div className="available-equipment">
                        <h4>📦 Available Equipment:</h4>
                        <div className="equipment-list">
                          {request.available_equipment.map(equipment => (
                            <div key={equipment.id} className="equipment-item">
                              <div className="equipment-info">
                                <strong>{equipment.name}</strong>
                                <small>SN: {equipment.serial_number}</small>
                                <span className={`condition-badge condition-${equipment.condition}`}>
                                  {equipment.condition}
                                </span>
                              </div>
                              <button
                                className="btn-approve"
                                onClick={() => handleApproveAndAllocate(request, equipment.id)}
                                disabled={approving}
                              >
                                {approving ? 'Approving...' : '✅ Approve & Issue'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!request.available_equipment || request.available_equipment.length === 0) && (
                      <div className="no-equipment">
                        <p>⚠️ No matching equipment available</p>
                        <small>Consider purchasing or waiting for returns</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'allocations' && (
          <div className="allocations-section">
            {activeAllocations.length === 0 ? (
              <div className="empty-state">
                <p>📦 No active allocations</p>
                <small>No equipment is currently issued</small>
              </div>
            ) : (
              <div className="allocations-table">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Equipment</th>
                      <th>Issued Date</th>
                      <th>Return Due</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAllocations.map(allocation => (
                      <tr key={allocation.id} className={isOverdue(allocation.expected_return_date) ? 'row-overdue' : ''}>
                        <td>
                          <strong>{allocation.employee_name}</strong>
                          <br />
                          <small>{allocation.employee_department}</small>
                        </td>
                        <td>
                          <strong>{allocation.equipment_name}</strong>
                          <br />
                          <small>SN: {allocation.equipment_serial}</small>
                        </td>
                        <td>{format(new Date(allocation.allocated_date), 'MMM dd, yyyy')}</td>
                        <td>
                          {format(new Date(allocation.expected_return_date), 'MMM dd, yyyy')}
                          {isOverdue(allocation.expected_return_date) && (
                            <span className="overdue-badge">⚠️ OVERDUE</span>
                          )}
                        </td>
                        <td>
                          {allocation.status === 'return_pending' ? (
                            <span className="status-badge status-return-pending">
                              🔄 Return Requested
                            </span>
                          ) : (
                            <span className="status-badge status-active">
                              ✅ Active
                            </span>
                          )}
                        </td>
                        <td>
                          {allocation.status === 'return_pending' ? (
                            <div className="return-actions">
                              <button
                                className="btn-process-return btn-good"
                                onClick={() => handleProcessReturn(allocation, false)}
                                disabled={processingReturn === allocation.id}
                              >
                                ✅ Good Condition
                              </button>
                              <button
                                className="btn-process-return btn-maintenance"
                                onClick={() => handleProcessReturn(allocation, true)}
                                disabled={processingReturn === allocation.id}
                              >
                                🔧 Needs Maintenance
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted">Waiting for return</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-button" onClick={loadDashboardData}>
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default ITDashboard;
