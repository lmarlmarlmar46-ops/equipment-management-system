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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 'var(--space-4)' }}>
        <div className="loading-spinner"></div>
        <p className="body-base" style={{ color: 'var(--text-secondary)' }}>Loading IT Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="it-dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="heading-2">IT Operations Dashboard</h1>
            <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
              Manage equipment requests, allocations, and returns
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={loadDashboardData}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.5 2V8M21.5 8H15.5M21.5 8L18 4.5C16.7 3.2 14.8 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17 22 21 18.5 21.5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card stat-card-warning">
          <div className="stat-header">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="stat-label">Pending Requests</span>
          </div>
          <div className="stat-value">{stats?.pending_requests || 0}</div>
        </div>

        <div className="stat-card stat-card-primary">
          <div className="stat-header">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="stat-label">Active Allocations</span>
          </div>
          <div className="stat-value">{stats?.active_allocations || 0}</div>
        </div>

        <div className="stat-card stat-card-error">
          <div className="stat-header">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7632 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="stat-label">Overdue Returns</span>
          </div>
          <div className="stat-value">{stats?.overdue_count || 0}</div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-header">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="stat-label">Returns Pending</span>
          </div>
          <div className="stat-value">{stats?.returns_pending || 0}</div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-header">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="stat-label">Available Equipment</span>
          </div>
          <div className="stat-value">{stats?.available_equipment || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button 
            className={`btn btn-tertiary ${activeTab === 'requests' ? 'is-active' : ''}`}
            style={{ 
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              borderBottom: activeTab === 'requests' ? '2px solid var(--brand-primary)' : 'none',
              background: activeTab === 'requests' ? 'var(--bg-secondary)' : 'transparent'
            }}
            onClick={() => setActiveTab('requests')}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button 
            className={`btn btn-tertiary ${activeTab === 'allocations' ? 'is-active' : ''}`}
            style={{ 
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              borderBottom: activeTab === 'allocations' ? '2px solid var(--brand-primary)' : 'none',
              background: activeTab === 'allocations' ? 'var(--bg-secondary)' : 'transparent'
            }}
            onClick={() => setActiveTab('allocations')}
          >
            Active Allocations ({activeAllocations.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'requests' && (
          <div className="requests-section">
            {pendingRequests.length === 0 ? (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--success)', margin: '0 auto var(--space-4)' }}>
                    <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3 className="heading-4" style={{ marginBottom: 'var(--space-2)' }}>No pending requests</h3>
                  <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>All equipment requests have been processed</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {pendingRequests.map(request => (
                  <div key={request.id} className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 className="card-header-title">{request.employee_name}</h3>
                        <p className="caption" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                          {request.department} • {request.employee_email}
                        </p>
                      </div>
                      <span className={`badge ${
                        request.priority === 'critical' ? 'badge-error' :
                        request.priority === 'high' ? 'badge-warning' :
                        request.priority === 'medium' ? 'badge-info' :
                        'badge-success'
                      }`}>
                        {request.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="card-body">
                      <div style={{ marginBottom: 'var(--space-4)' }}>
                        <p className="body-sm" style={{ fontWeight: '500', marginBottom: 'var(--space-2)' }}>Equipment Type</p>
                        <p className="body-base">{request.equipment_type}</p>
                      </div>

                      <div style={{ marginBottom: 'var(--space-4)' }}>
                        <p className="body-sm" style={{ fontWeight: '500', marginBottom: 'var(--space-2)' }}>Request Details</p>
                        <p className="body-sm" style={{ color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                          {request.description}
                        </p>
                      </div>

                      <p className="caption" style={{ color: 'var(--text-tertiary)' }}>
                        Submitted: {format(new Date(request.created_at), 'MMM dd, yyyy')}
                      </p>

                      {request.available_equipment && request.available_equipment.length > 0 && (
                        <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                          <h4 className="heading-6" style={{ marginBottom: 'var(--space-4)' }}>Available Equipment</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {request.available_equipment.map(equipment => (
                              <div key={equipment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)' }}>
                                <div>
                                  <strong className="body-base">{equipment.name}</strong>
                                  <p className="caption" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                                    SN: {equipment.serial_number}
                                  </p>
                                  <span className={`badge badge-${equipment.condition === 'excellent' ? 'success' : equipment.condition === 'good' ? 'info' : 'warning'}`} style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>
                                    {equipment.condition}
                                  </span>
                                </div>
                                <button
                                  className={`btn btn-success ${approving ? 'is-loading' : ''}`}
                                  onClick={() => handleApproveAndAllocate(request, equipment.id)}
                                  disabled={approving}
                                >
                                  Approve & Issue
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(!request.available_equipment || request.available_equipment.length === 0) && (
                        <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning)' }}>
                          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--warning)', flexShrink: 0 }}>
                              <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7632 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div>
                              <p className="body-sm" style={{ fontWeight: '500', marginBottom: 'var(--space-1)' }}>No matching equipment available</p>
                              <p className="caption" style={{ color: 'var(--text-secondary)' }}>Consider purchasing or waiting for returns</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'allocations' && (
          <div className="allocations-section">
            {activeAllocations.length === 0 ? (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4)' }}>
                    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3 className="heading-4" style={{ marginBottom: 'var(--space-2)' }}>No active allocations</h3>
                  <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>No equipment is currently issued</p>
                </div>
              </div>
            ) : (
              <div className="table-container">
                <div className="table-wrapper">
                  <table className="data-table">
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
                          <td data-label="Employee">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                              <strong>{allocation.employee_name}</strong>
                              <span className="caption">{allocation.employee_department}</span>
                            </div>
                          </td>
                          <td data-label="Equipment">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                              <strong>{allocation.equipment_name}</strong>
                              <code style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>SN: {allocation.equipment_serial}</code>
                            </div>
                          </td>
                          <td data-label="Issued Date">
                            <span className="body-sm">{format(new Date(allocation.allocated_date), 'MMM dd, yyyy')}</span>
                          </td>
                          <td data-label="Return Due">
                            <span className="body-sm">{format(new Date(allocation.expected_return_date), 'MMM dd, yyyy')}</span>
                            {isOverdue(allocation.expected_return_date) && (
                              <span className="badge badge-error" style={{ display: 'block', marginTop: 'var(--space-1)', width: 'fit-content' }}>OVERDUE</span>
                            )}
                          </td>
                          <td data-label="Status">
                            {allocation.status === 'return_pending' ? (
                              <span className="badge badge-warning">Return Requested</span>
                            ) : (
                              <span className="badge badge-success">Active</span>
                            )}
                          </td>
                          <td data-label="Actions">
                            {allocation.status === 'return_pending' ? (
                              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleProcessReturn(allocation, false)}
                                  disabled={processingReturn === allocation.id}
                                >
                                  Good Condition
                                </button>
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => handleProcessReturn(allocation, true)}
                                  disabled={processingReturn === allocation.id}
                                >
                                  Needs Maintenance
                                </button>
                              </div>
                            ) : (
                              <span className="caption" style={{ color: 'var(--text-tertiary)' }}>Waiting for return</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ITDashboard;
