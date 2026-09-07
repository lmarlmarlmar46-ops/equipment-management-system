import React, { useState, useEffect } from 'react';

function Allocations() {
  const [allocations, setAllocations] = useState([]);
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [formData, setFormData] = useState({
    equipment_id: '',
    employee_id: '',
    allocated_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAllocations();
  }, [allocations, searchQuery, filterStatus]);

  const filterAllocations = () => {
    let filtered = [...allocations];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(alloc =>
        alloc.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alloc.equipment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alloc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alloc.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(alloc => alloc.status === filterStatus);
    }
    
    setFilteredAllocations(filtered);
  };

  const getQuickStats = () => {
    const activeCount = allocations.filter(a => a.status === 'active').length;
    const overdueCount = allocations.filter(a => {
      if (a.status !== 'active' || !a.expected_return_date) return false;
      return new Date(a.expected_return_date) < new Date();
    }).length;
    const returnedCount = allocations.filter(a => a.status === 'returned').length;
    
    return { activeCount, overdueCount, returnedCount };
  };

  const isOverdue = (allocation) => {
    if (allocation.status !== 'active' || !allocation.expected_return_date) return false;
    return new Date(allocation.expected_return_date) < new Date();
  };

  const fetchData = async () => {
    try {
      const [allocRes, empRes, eqRes] = await Promise.all([
        fetch('/api/allocations'),
        fetch('/api/employees'),
        fetch('/api/equipment/available')
      ]);
      
      const [allocData, empData, eqData] = await Promise.all([
        allocRes.json(),
        empRes.json(),
        eqRes.json()
      ]);
      
      setAllocations(allocData);
      setEmployees(empData);
      setEquipment(eqData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchData();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create allocation');
      }
    } catch (error) {
      console.error('Error creating allocation:', error);
      alert('Failed to create allocation');
    }
  };

  const handleReturn = async (id) => {
    if (window.confirm('Mark this equipment as returned?')) {
      try {
        const response = await fetch(`/api/allocations/${id}/return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actual_return_date: new Date().toISOString().split('T')[0]
          })
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error('Error returning equipment:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      equipment_id: '',
      employee_id: '',
      allocated_date: new Date().toISOString().split('T')[0],
      expected_return_date: '',
      notes: ''
    });
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading allocations...</div>
      </div>
    );
  }

  const { activeCount, overdueCount, returnedCount } = getQuickStats();

  return (
    <div className="allocations-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="heading-2">Equipment Allocations</h1>
            <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
              Track equipment assignments and returns
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {showForm ? 'Cancel' : 'New Allocation'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card stat-card-primary">
          <div className="stat-header">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-value">{activeCount}</div>
        </div>
        
        <div className="stat-card stat-card-warning">
          <div className="stat-header">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7632 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="stat-label">Overdue</span>
          </div>
          <div className="stat-value">{overdueCount}</div>
        </div>
        
        <div className="stat-card stat-card-success">
          <div className="stat-header">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="stat-label">Returned</span>
          </div>
          <div className="stat-value">{returnedCount}</div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header">
            <h3 className="card-header-title">Create New Allocation</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-5)' }}>
                <div className="form-group">
                  <label className="form-label is-required">Employee</label>
                  <select
                    className="form-select"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.filter(e => e.status === 'active').map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label is-required">Equipment</label>
                  <select
                    className="form-select"
                    value={formData.equipment_id}
                    onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                    required
                  >
                    <option value="">Select Equipment</option>
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} - {eq.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label is-required">Allocated Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.allocated_date}
                    onChange={(e) => setFormData({ ...formData, allocated_date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expected Return Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.expected_return_date}
                    onChange={(e) => setFormData({ ...formData, expected_return_date: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter any additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table with Toolbar */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="table-search">
              <svg className="table-search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="table-search-input"
                placeholder="Search allocations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="page-size-selector">
              <span>Status:</span>
              <select 
                className="page-size-select"
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>
          <div className="table-toolbar-right">
            <span className="pagination-info">
              {filteredAllocations.length} of {allocations.length} allocations
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Equipment</th>
                <th>Category</th>
                <th>Allocated</th>
                <th>Expected Return</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="table-empty">
                      {searchQuery || filterStatus !== 'active' ? (
                        <>
                          <svg className="table-empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <h3 className="table-empty-title">No matching allocations found</h3>
                          <p className="table-empty-message">
                            Try adjusting your search or filters
                          </p>
                          <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); setFilterStatus('active'); }}>
                            Clear Filters
                          </button>
                        </>
                      ) : (
                        <>
                          <svg className="table-empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21M4 7H20M4 15H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <h3 className="table-empty-title">No allocations yet</h3>
                          <p className="table-empty-message">
                            Create your first allocation to track equipment assignments
                          </p>
                          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            New Allocation
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((allocation) => (
                  <tr key={allocation.id}>
                    <td data-label="Employee">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <strong>{allocation.employee_name}</strong>
                        <span className="caption" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {allocation.employee_email}
                        </span>
                        {allocation.department && (
                          <span className="caption" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 21H21M3 7V21M14 7V21M21 7V21M3 7L12 3L21 7M8 11H9M8 15H9M15 11H16M15 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {allocation.department}
                          </span>
                        )}
                      </div>
                    </td>
                    <td data-label="Equipment">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <strong>{allocation.equipment_name}</strong>
                        {allocation.serial_number && (
                          <code style={{ fontSize: 'var(--text-xs)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
                            {allocation.serial_number}
                          </code>
                        )}
                      </div>
                    </td>
                    <td data-label="Category">
                      <span className="badge badge-info">{allocation.category}</span>
                    </td>
                    <td data-label="Allocated">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {formatDate(allocation.allocated_date)}
                      </span>
                    </td>
                    <td data-label="Expected Return">
                      {allocation.expected_return_date ? (
                        <span className={`badge ${isOverdue(allocation) ? 'badge-error' : 'badge-warning'}`}>
                          {formatDate(allocation.expected_return_date)}
                          {isOverdue(allocation) && ' (Overdue)'}
                        </span>
                      ) : (
                        <span className="badge badge-neutral">N/A</span>
                      )}
                    </td>
                    <td data-label="Status">
                      <span className={`badge ${allocation.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                        {allocation.status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      {allocation.status === 'active' && (
                        <button 
                          className="btn btn-sm btn-secondary" 
                          onClick={() => handleReturn(allocation.id)}
                          title="Mark as returned"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 14L4 9L9 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 9H14C16.2091 9 18.3436 9.87498 19.9246 11.4555C21.5057 13.0361 22.3807 15.1705 22.3807 17.3796" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Allocations;
