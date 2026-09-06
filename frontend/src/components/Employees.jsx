import React, { useState, useEffect, useMemo } from 'react';
import LoadingSkeleton from './LoadingSkeleton';

function Employees({ showToast }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    location: '',
    status: 'active'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter, sort, and paginate employees
  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = [...employees];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(emp => emp.status === filterStatus);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [employees, searchQuery, filterStatus, sortConfig]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      if (showToast) showToast('error', 'Error', 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      if (showToast) showToast('warning', 'Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
      const url = editingId ? `/api/employees/${editingId}` : '/api/employees';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchEmployees();
        resetForm();
        if (showToast) {
          showToast('success', editingId ? 'Updated!' : 'Created!', 
            `Employee ${editingId ? 'updated' : 'created'} successfully`);
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      if (showToast) showToast('error', 'Error', 'Failed to save employee');
    }
  };

  const handleEdit = (employee) => {
    setFormData(employee);
    setEditingId(employee.id);
    setShowForm(true);
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchEmployees();
          if (showToast) showToast('success', 'Deleted!', 'Employee deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        if (showToast) showToast('error', 'Error', 'Failed to delete employee');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      location: '',
      status: 'active'
    });
    setEditingId(null);
    setShowForm(false);
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="employees-container">
        <div className="section-header">
          <div>
            <h2>Employee Management</h2>
            <p className="section-subtitle">Manage employee records and assignments</p>
          </div>
        </div>
        <LoadingSkeleton type="table" count={8} />
      </div>
    );
  }

  return (
    <div className="employees-container">
      <div className="section-header">
        <div>
          <h2>Employee Management</h2>
          <p className="section-subtitle">Manage employee records and assignments</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✖ Cancel' : '➕ Add Employee'}
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search employees by name, email, department, or location..."
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
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="results-count">
          {filteredAndSortedEmployees.length} of {employees.length} employees
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update' : 'Create'}
              </button>
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
              <th>Email</th>
              <th>Department</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  {searchQuery || filterStatus !== 'all' ? (
                    <>
                      <div className="empty-state-icon">🔍</div>
                      <div className="empty-state-title">No matching employees found</div>
                      <div className="empty-state-description">
                        Try adjusting your search or filters
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="empty-state-icon">👥</div>
                      <div className="empty-state-title">No employees yet</div>
                      <div className="empty-state-description">
                        Add your first employee above to get started
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-info">
                      <strong>{employee.name}</strong>
                      <span className="employee-id">ID: {employee.id.substring(0, 8)}</span>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${employee.email}`} className="email-link">
                      {employee.email}
                    </a>
                  </td>
                  <td>
                    <span className="department-badge">{employee.department || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="location-tag">📍 {employee.location || 'N/A'}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${employee.status}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-edit" onClick={() => handleEdit(employee)} title="Edit">
                      ✏️
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(employee.id)} title="Delete">
                      🗑️
                    </button>
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

export default Employees;
