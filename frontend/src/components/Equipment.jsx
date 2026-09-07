import React, { useState, useEffect, useMemo } from 'react';
import LoadingSkeleton from './LoadingSkeleton';

function Equipment({ showToast }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    purchase_price: '',
    status: 'available',
    condition: 'good',
    notes: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Filter, sort, and paginate equipment using useMemo for performance
  const filteredAndSortedEquipment = useMemo(() => {
    let filtered = [...equipment];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serial_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [equipment, searchQuery, filterStatus, sortConfig]);

  // Paginated equipment
  const paginatedEquipment = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedEquipment.slice(startIndex, endIndex);
  }, [filteredAndSortedEquipment, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedEquipment.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/equipment');
      const data = await response.json();
      setEquipment(data);
      if (showToast) {
        showToast('success', 'Success', 'Equipment data loaded', false);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      if (showToast) {
        showToast('error', 'Error', 'Failed to load equipment data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/equipment/${editingId}` : '/api/equipment';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchEquipment();
        resetForm();
        if (showToast) {
          showToast('success', editingId ? 'Updated!' : 'Created!', 
            `Equipment ${editingId ? 'updated' : 'created'} successfully`);
        }
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
      if (showToast) {
        showToast('error', 'Error', 'Failed to save equipment');
      }
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        const response = await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchEquipment();
          if (showToast) {
            showToast('success', 'Deleted!', 'Equipment deleted successfully');
          }
        }
      } catch (error) {
        console.error('Error deleting equipment:', error);
        if (showToast) {
          showToast('error', 'Error', 'Failed to delete equipment');
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      brand: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      purchase_price: '',
      status: 'available',
      condition: 'good',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'status-badge available',
      allocated: 'status-badge allocated',
      maintenance: 'status-badge maintenance',
      retired: 'status-badge retired'
    };
    return badges[status] || 'status-badge';
  };

  if (loading) {
    return (
      <div className="equipment-container">
        <div className="section-header">
          <div>
            <h2>Equipment Management</h2>
            <p className="section-subtitle">Manage and track all your equipment inventory</p>
          </div>
        </div>
        <LoadingSkeleton type="table" count={8} />
      </div>
    );
  }

  return (
    <div className="equipment-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="heading-2">Equipment Management</h1>
            <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
              Manage and track all your equipment inventory
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {showForm ? 'Cancel' : 'Add Equipment'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header">
            <h3 className="card-header-title">
              {editingId ? 'Edit Equipment' : 'Add New Equipment'}
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-5)' }}>
                <div className="form-group">
                  <label className="form-label is-required">Equipment Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter equipment name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label is-required">Category</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Serial Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter serial number"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Price</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="available">Available</option>
                    <option value="allocated">Allocated</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    className="form-select"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Additional notes or comments"
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
                  {editingId ? 'Update Equipment' : 'Create Equipment'}
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
                placeholder="Search equipment..."
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
                <option value="available">Available</option>
                <option value="allocated">Allocated</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
          <div className="table-toolbar-right">
            <span className="pagination-info">
              {filteredAndSortedEquipment.length} of {equipment.length} items
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
                  Name
                  <svg className="table-sort-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L12 19M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </th>
                <th 
                  className={`table-header-sortable ${sortConfig.key === 'category' ? `is-sorted ${sortConfig.direction === 'desc' ? 'is-sorted-desc' : ''}` : ''}`}
                  onClick={() => handleSort('category')}
                >
                  Category
                  <svg className="table-sort-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L12 19M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </th>
                <th 
                  className={`table-header-sortable ${sortConfig.key === 'brand' ? `is-sorted ${sortConfig.direction === 'desc' ? 'is-sorted-desc' : ''}` : ''}`}
                  onClick={() => handleSort('brand')}
                >
                  Brand/Model
                  <svg className="table-sort-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L12 19M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </th>
                <th>Serial Number</th>
                <th 
                  className={`table-header-sortable ${sortConfig.key === 'status' ? `is-sorted ${sortConfig.direction === 'desc' ? 'is-sorted-desc' : ''}` : ''}`}
                  onClick={() => handleSort('status')}
                >
                  Status
                  <svg className="table-sort-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L12 19M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </th>
                <th 
                  className={`table-header-sortable ${sortConfig.key === 'condition' ? `is-sorted ${sortConfig.direction === 'desc' ? 'is-sorted-desc' : ''}` : ''}`}
                  onClick={() => handleSort('condition')}
                >
                  Condition
                  <svg className="table-sort-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L12 19M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedEquipment.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="table-empty">
                      {searchQuery || filterStatus !== 'all' ? (
                        <>
                          <svg className="table-empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <h3 className="table-empty-title">No matching equipment found</h3>
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
                            <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <h3 className="table-empty-title">No equipment yet</h3>
                          <p className="table-empty-message">
                            Add your first equipment item to start tracking your inventory
                          </p>
                          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Add Equipment
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEquipment.map((item) => (
                  <tr key={item.id} data-label="Equipment">
                    <td data-label="Name">
                      <strong>{item.name}</strong>
                    </td>
                    <td data-label="Category">
                      <span className="badge badge-neutral">{item.category}</span>
                    </td>
                    <td data-label="Brand/Model">{item.brand} {item.model}</td>
                    <td data-label="Serial">
                      <code style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        {item.serial_number || 'N/A'}
                      </code>
                    </td>
                    <td data-label="Status">
                      <span className={`badge badge-status-${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td data-label="Condition">
                      <span className={`badge ${
                        item.condition === 'excellent' ? 'badge-success' :
                        item.condition === 'good' ? 'badge-info' :
                        item.condition === 'fair' ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {item.condition}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="row-actions">
                        <button 
                          className="row-action-btn" 
                          onClick={() => handleEdit(item)} 
                          title="Edit"
                          aria-label="Edit equipment"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button 
                          className="row-action-btn" 
                          onClick={() => handleDelete(item.id)} 
                          title="Delete"
                          aria-label="Delete equipment"
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
        {filteredAndSortedEquipment.length > 0 && (
          <div className="table-pagination">
            <div className="pagination-info">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedEquipment.length)} of {filteredAndSortedEquipment.length} items
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                aria-label="First page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

export default Equipment;
