import React, { useState, useEffect } from 'react';

function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchQuery, filterStatus]);

  const filterEquipment = () => {
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
    
    setFilteredEquipment(filtered);
  };

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment');
      const data = await response.json();
      setEquipment(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching equipment:', error);
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
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
        fetchEquipment();
      } catch (error) {
        console.error('Error deleting equipment:', error);
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
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading equipment...</div>
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
          {filteredEquipment.length} of {equipment.length} items
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
              <th>Name</th>
              <th>Category</th>
              <th>Brand/Model</th>
              <th>Serial Number</th>
              <th>Status</th>
              <th>Condition</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  {searchQuery || filterStatus !== 'all' ? (
                    <>
                      <div className="empty-state-icon">🔍</div>
                      <div className="empty-state-title">No matching equipment found</div>
                      <div className="empty-state-description">
                        Try adjusting your search or filters
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="empty-state-icon">💻</div>
                      <div className="empty-state-title">No equipment yet</div>
                      <div className="empty-state-description">
                        Add your first equipment item above to get started
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              filteredEquipment.map((item) => (
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
      </div>
    </div>
  );
}

export default Equipment;
