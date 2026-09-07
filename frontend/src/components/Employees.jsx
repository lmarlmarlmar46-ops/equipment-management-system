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
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="heading-2">Employee Management</h1>
            <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
              Manage employee records and assignments
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {showForm ? 'Cancel' : 'Add Employee'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header">
            <h3 className="card-header-title">
              {editingId ? 'Edit Employee' : 'Add New Employee'}
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-5)' }}>
                <div className="form-group">
                  <label className="form-label is-required">Full Name</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.name ? 'is-error' : ''}`}
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  {formErrors.name && <div className="form-error">{formErrors.name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label is-required">Email</label>
                  <input
                    type="email"
                    className={`form-input ${formErrors.email ? 'is-error' : ''}`}
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  {formErrors.email && <div className="form-error">{formErrors.email}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label is-required">Department</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.department ? 'is-error' : ''}`}
                    placeholder="Enter department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                  {formErrors.department && <div className="form-error">{formErrors.department}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Employee' : 'Create Employee'}
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
                placeholder="Search employees..."
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
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="table-toolbar-right">
            <span className="pagination-info">
              {filteredAndSortedEmployees.length} of {employees.length} employees
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th 
                  className={`table-header-sortable ${sortConfig.key === 'name' ? `is-sorted ${sortConfig.direction === 'desc' ? 'is-sorted-desc' : ''}` : ''}`}
                  onClick={() => handleSort('name')}
                >
                  Employee
                  <svg className="table-sort-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L12 19M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </th>
                <th 
                  className={`table-header-sortable ${sortConfig.key === 'email' ? `is-sorted ${sortConfig.direction === 'desc' ? 'is-sorted-desc' : ''}` : ''}`}
                  onClick={() => handleSort('email')}
                >
                  Email
                  <svg className="table-sort-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L12 19M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </th>
                <th 
                  className={`table-header-sortable ${sortConfig.key === 'department' ? `is-sorted ${sortConfig.direction === 'desc' ? 'is-sorted-desc' : ''}` : ''}`}
                  onClick={() => handleSort('department')}
                >
                  Department
                  <svg className="table-sort-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L12 19M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </th>
                <th>Location</th>
                <th 
                  className={`table-header-sortable ${sortConfig.key === 'status' ? `is-sorted ${sortConfig.direction === 'desc' ? 'is-sorted-desc' : ''}` : ''}`}
                  onClick={() => handleSort('status')}
                >
                  Status
                  <svg className="table-sort-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L12 19M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="table-empty">
                      {searchQuery || filterStatus !== 'all' ? (
                        <>
                          <svg className="table-empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <h3 className="table-empty-title">No matching employees found</h3>
                          <p className="table-empty-message">
                            Try adjusting your search or filters
                          </p>
                          <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}>
                            Clear Filters
                          </button>
                        </>
                      ) : (
                        <>
                          <svg className="table-empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          <h3 className="table-empty-title">No employees yet</h3>
                          <p className="table-empty-message">
                            Add your first employee to get started
                          </p>
                          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Add Employee
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((employee) => (
                  <tr key={employee.id} data-label="Employee">
                    <td data-label="Employee">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <strong>{employee.name}</strong>
                        <span className="caption">ID: {employee.id.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td data-label="Email">
                      <a 
                        href={`mailto:${employee.email}`} 
                        style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}
                      >
                        {employee.email}
                      </a>
                    </td>
                    <td data-label="Department">
                      <span className="badge badge-info">{employee.department || 'N/A'}</span>
                    </td>
                    <td data-label="Location">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {employee.location || 'N/A'}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span className={`badge ${employee.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="row-actions">
                        <button 
                          className="row-action-btn" 
                          onClick={() => handleEdit(employee)} 
                          title="Edit"
                          aria-label="Edit employee"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button 
                          className="row-action-btn" 
                          onClick={() => handleDelete(employee.id)} 
                          title="Delete"
                          aria-label="Delete employee"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAndSortedEmployees.length > 0 && (
          <div className="table-pagination">
            <div className="pagination-info">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedEmployees.length)} of {filteredAndSortedEmployees.length} employees
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'is-active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                    aria-label={`Page ${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="page-size-selector">
              <span>Items per page:</span>
              <select
                className="page-size-select"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                aria-label="Items per page"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Employees;
