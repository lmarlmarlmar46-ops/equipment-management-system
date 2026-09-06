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
      <div className="section-header">
        <div>
          <h2>Equipment Allocations</h2>
          <p className="section-subtitle">Track equipment assignments and returns</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✖ Cancel' : '➕ New Allocation'}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat-card">
          <div className="quick-stat-label">Active</div>
          <div className="quick-stat-value active-color">{activeCount}</div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-label">Overdue</div>
          <div className="quick-stat-value warning-color">{overdueCount}</div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-label">Returned</div>
          <div className="quick-stat-value success-color">{returnedCount}</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by employee, equipment, category, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              ✖
            </button>
          )}
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="returned">Returned</option>
          </select>
        </div>
        <div className="results-count">
          {filteredAllocations.length} of {allocations.length} allocations
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Create New Allocation</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <select
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                required
              >
                <option value="">Select Employee *</option>
                {employees.filter(e => e.status === 'active').map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.department}
                  </option>
                ))}
              </select>

              <select
                value={formData.equipment_id}
                onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                required
              >
                <option value="">Select Equipment *</option>
                {equipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} - {eq.category}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={formData.allocated_date}
                onChange={(e) => setFormData({ ...formData, allocated_date: e.target.value })}
                required
              />

              <input
                type="date"
                placeholder="Expected Return Date"
                value={formData.expected_return_date}
                onChange={(e) => setFormData({ ...formData, expected_return_date: e.target.value })}
              />
            </div>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
            />
            <div className="form-actions">
              <button type="submit" className="btn-primary">Allocate</button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
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
                <td colSpan="7" className="empty-state">
                  {searchQuery || filterStatus !== 'active' ? (
                    <>
                      <div className="empty-state-icon">🔍</div>
                      <div className="empty-state-title">No matching allocations found</div>
                      <div className="empty-state-description">
                        Try adjusting your search or filters
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="empty-state-icon">🔄</div>
                      <div className="empty-state-title">No allocations yet</div>
                      <div className="empty-state-description">
                        Create your first allocation above to track equipment assignments
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              filteredAllocations.map((allocation) => (
                <tr key={allocation.id}>
                  <td>
                    <div className="allocation-info">
                      <strong>{allocation.employee_name}</strong>
                      <div className="allocation-meta">
                        <span className="meta-item">📧 {allocation.employee_email}</span>
                        <span className="meta-item">🏢 {allocation.department}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="allocation-info">
                      <strong>{allocation.equipment_name}</strong>
                      {allocation.serial_number && (
                        <code className="serial-code">{allocation.serial_number}</code>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{allocation.category}</span>
                  </td>
                  <td>
                    <span className="date-badge">
                      📅 {formatDate(allocation.allocated_date)}
                    </span>
                  </td>
                  <td>
                    {allocation.expected_return_date ? (
                      <span className={`date-badge ${isOverdue(allocation) ? 'overdue' : 'upcoming'}`}>
                        {isOverdue(allocation) ? '⚠️' : '📅'} {formatDate(allocation.expected_return_date)}
                      </span>
                    ) : (
                      <span className="date-badge">N/A</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${allocation.status}`}>
                      {allocation.status}
                    </span>
                  </td>
                  <td className="actions">
                    {allocation.status === 'active' && (
                      <button 
                        className="btn-return" 
                        onClick={() => handleReturn(allocation.id)}
                        title="Mark as returned"
                      >
                        ↩️ Return
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
  );
}

export default Allocations;
