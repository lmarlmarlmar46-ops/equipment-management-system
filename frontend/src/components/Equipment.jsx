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
      <div className="section-header">
        <div>
          <h2>Equipment Management</h2>
          <p className="section-subtitle">Manage and track all your equipment inventory</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✖ Cancel' : '➕ Add Equipment'}
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search equipment by name, category, brand, or serial..."
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
            <option value="available">Available</option>
            <option value="allocated">Allocated</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </select>
        </div>
        <div className="results-count">
          {filteredAndSortedEquipment.length} of {equipment.length} items
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingId ? 'Edit Equipment' : 'Add New Equipment'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Equipment Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Category *"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
              <input
                type="text"
                placeholder="Model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
              <input
                type="text"
                placeholder="Serial Number"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              />
              <input
                type="date"
                placeholder="Purchase Date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
              <input
                type="number"
                placeholder="Purchase Price"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="allocated">Allocated</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
            />
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
              <th 
                className={`table-header-cell sortable ${sortConfig.key === 'name' ? `sorted-${sortConfig.direction}` : ''}`}
                onClick={() => handleSort('name')}
                title="Click to sort"
              >
                Name
              </th>
              <th 
                className={`table-header-cell sortable ${sortConfig.key === 'category' ? `sorted-${sortConfig.direction}` : ''}`}
                onClick={() => handleSort('category')}
                title="Click to sort"
              >
                Category
              </th>
              <th 
                className={`table-header-cell sortable ${sortConfig.key === 'brand' ? `sorted-${sortConfig.direction}` : ''}`}
                onClick={() => handleSort('brand')}
                title="Click to sort"
              >
                Brand/Model
              </th>
              <th>Serial Number</th>
              <th 
                className={`table-header-cell sortable ${sortConfig.key === 'status' ? `sorted-${sortConfig.direction}` : ''}`}
                onClick={() => handleSort('status')}
                title="Click to sort"
              >
                Status
              </th>
              <th 
                className={`table-header-cell sortable ${sortConfig.key === 'condition' ? `sorted-${sortConfig.direction}` : ''}`}
                onClick={() => handleSort('condition')}
                title="Click to sort"
              >
                Condition
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedEquipment.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    {searchQuery || filterStatus !== 'all' ? (
                      <>
                        <div className="empty-state-icon">🔍</div>
                        <div className="empty-state-title">No matching equipment found</div>
                        <div className="empty-state-description">
                          Try adjusting your search or filters
                        </div>
                        <div className="empty-state-actions">
                          <button className="btn-secondary" onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}>
                            Clear Filters
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="empty-state-icon">💻</div>
                        <div className="empty-state-title">No equipment yet</div>
                        <div className="empty-state-description">
                          Add your first equipment item to start tracking your inventory
                        </div>
                        <div className="empty-state-actions">
                          <button className="btn-primary" onClick={() => setShowForm(true)}>
                            ➕ Add Equipment
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedEquipment.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="item-name">
                      <strong>{item.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{item.category}</span>
                  </td>
                  <td>{item.brand} {item.model}</td>
                  <td>
                    <code className="serial-code">{item.serial_number || 'N/A'}</code>
                  </td>
                  <td>
                    <span className={getStatusBadge(item.status)}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <span className={`condition-badge ${item.condition}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-edit" onClick={() => handleEdit(item)} title="Edit">
                      ✏️
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(item.id)} title="Delete">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {filteredAndSortedEquipment.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedEquipment.length)} of {filteredAndSortedEquipment.length} items
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                aria-label="First page"
              >
                ⏮
              </button>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                ◀
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show first, last, current, and adjacent pages
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                      aria-label={`Page ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} style={{ padding: '0.5rem' }}>...</span>;
                }
                return null;
              })}

              <button
                className="pagination-button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                ▶
              </button>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
              >
                ⏭
              </button>
            </div>
            <div className="page-size-selector">
              <span>Items per page:</span>
              <select
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
