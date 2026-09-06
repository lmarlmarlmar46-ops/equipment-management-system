const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Export equipment to CSV
router.get('/export/equipment', authenticateToken, (req, res) => {
  db.all('SELECT * FROM equipment ORDER BY created_at DESC', [], (err, equipment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Generate CSV
    const headers = ['ID', 'Name', 'Category', 'Brand', 'Model', 'Serial Number', 'Purchase Date', 'Purchase Price', 'Status', 'Condition', 'Notes'];
    const csvRows = [headers.join(',')];
    
    equipment.forEach(item => {
      const row = [
        item.id,
        `"${item.name}"`,
        item.category,
        item.brand || '',
        item.model || '',
        item.serial_number || '',
        item.purchase_date || '',
        item.purchase_price || '',
        item.status,
        item.condition,
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csv = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="equipment_export_${Date.now()}.csv"`);
    res.send(csv);
  });
});

// Export employees to CSV
router.get('/export/employees', authenticateToken, (req, res) => {
  db.all('SELECT * FROM employees ORDER BY created_at DESC', [], (err, employees) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const headers = ['ID', 'Name', 'Email', 'Department', 'Location', 'Status'];
    const csvRows = [headers.join(',')];
    
    employees.forEach(emp => {
      const row = [
        emp.id,
        `"${emp.name}"`,
        emp.email,
        emp.department || '',
        emp.location || '',
        emp.status
      ];
      csvRows.push(row.join(','));
    });
    
    const csv = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="employees_export_${Date.now()}.csv"`);
    res.send(csv);
  });
});

// Export allocations to CSV
router.get('/export/allocations', authenticateToken, (req, res) => {
  db.all(
    `SELECT 
       a.*,
       e.name as employee_name,
       eq.name as equipment_name,
       eq.serial_number
     FROM allocations a
     LEFT JOIN employees e ON a.employee_id = e.id
     LEFT JOIN equipment eq ON a.equipment_id = eq.id
     ORDER BY a.created_at DESC`,
    [],
    (err, allocations) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const headers = ['ID', 'Equipment Name', 'Serial Number', 'Employee Name', 'Allocated Date', 'Expected Return', 'Actual Return', 'Status', 'Notes'];
      const csvRows = [headers.join(',')];
      
      allocations.forEach(alloc => {
        const row = [
          alloc.id,
          `"${alloc.equipment_name}"`,
          alloc.serial_number || '',
          `"${alloc.employee_name}"`,
          alloc.allocated_date,
          alloc.expected_return_date || '',
          alloc.actual_return_date || '',
          alloc.status,
          `"${(alloc.notes || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      });
      
      const csv = csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="allocations_export_${Date.now()}.csv"`);
      res.send(csv);
    }
  );
});

// Bulk import equipment (CSV format)
router.post('/import/equipment', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const { data } = req.body; // Array of equipment objects
  
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Data array is required' });
  }
  
  const results = {
    success: [],
    failed: []
  };
  
  let processed = 0;
  
  data.forEach((item, index) => {
    // Validate required fields
    if (!item.name || !item.category) {
      results.failed.push({
        row: index + 1,
        data: item,
        error: 'Name and category are required'
      });
      processed++;
      return;
    }
    
    const id = uuidv4();
    const created_at = new Date().toISOString();
    
    db.run(
      `INSERT INTO equipment 
       (id, name, category, brand, model, serial_number, purchase_date, purchase_price, status, condition, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        item.name,
        item.category,
        item.brand || null,
        item.model || null,
        item.serial_number || null,
        item.purchase_date || null,
        item.purchase_price || null,
        item.status || 'available',
        item.condition || 'good',
        item.notes || null,
        created_at
      ],
      function (err) {
        if (err) {
          results.failed.push({
            row: index + 1,
            data: item,
            error: err.message
          });
        } else {
          results.success.push({
            row: index + 1,
            id,
            name: item.name
          });
        }
        
        processed++;
        
        // Send response when all processed
        if (processed === data.length) {
          res.json({
            total: data.length,
            successCount: results.success.length,
            failedCount: results.failed.length,
            results
          });
        }
      }
    );
  });
});

// Bulk import employees
router.post('/import/employees', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const { data } = req.body;
  
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Data array is required' });
  }
  
  const results = {
    success: [],
    failed: []
  };
  
  let processed = 0;
  
  data.forEach((item, index) => {
    if (!item.name || !item.email) {
      results.failed.push({
        row: index + 1,
        data: item,
        error: 'Name and email are required'
      });
      processed++;
      return;
    }
    
    const id = uuidv4();
    const created_at = new Date().toISOString();
    
    db.run(
      `INSERT INTO employees 
       (id, name, email, department, location, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        item.name,
        item.email,
        item.department || null,
        item.location || null,
        item.status || 'active',
        created_at
      ],
      function (err) {
        if (err) {
          results.failed.push({
            row: index + 1,
            data: item,
            error: err.message
          });
        } else {
          results.success.push({
            row: index + 1,
            id,
            name: item.name
          });
        }
        
        processed++;
        
        if (processed === data.length) {
          res.json({
            total: data.length,
            successCount: results.success.length,
            failedCount: results.failed.length,
            results
          });
        }
      }
    );
  });
});

// Bulk update equipment status
router.patch('/update/equipment-status', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const { equipment_ids, status } = req.body;
  
  if (!equipment_ids || !Array.isArray(equipment_ids) || !status) {
    return res.status(400).json({ error: 'equipment_ids array and status are required' });
  }
  
  const validStatuses = ['available', 'allocated', 'maintenance', 'retired'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const placeholders = equipment_ids.map(() => '?').join(',');
  
  db.run(
    `UPDATE equipment SET status = ? WHERE id IN (${placeholders})`,
    [status, ...equipment_ids],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        message: 'Bulk update successful',
        updatedCount: this.changes,
        status
      });
    }
  );
});

// Bulk delete equipment
router.delete('/delete/equipment', authenticateToken, authorizeRole('admin'), (req, res) => {
  const { equipment_ids } = req.body;
  
  if (!equipment_ids || !Array.isArray(equipment_ids)) {
    return res.status(400).json({ error: 'equipment_ids array is required' });
  }
  
  const placeholders = equipment_ids.map(() => '?').join(',');
  
  db.run(
    `DELETE FROM equipment WHERE id IN (${placeholders})`,
    equipment_ids,
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        message: 'Bulk delete successful',
        deletedCount: this.changes
      });
    }
  );
});

// Get import template
router.get('/template/:type', authenticateToken, (req, res) => {
  const { type } = req.params;
  
  const templates = {
    equipment: {
      headers: ['name', 'category', 'brand', 'model', 'serial_number', 'purchase_date', 'purchase_price', 'status', 'condition', 'notes'],
      example: [
        'Laptop Dell XPS 15',
        'Laptops',
        'Dell',
        'XPS 15 9520',
        'SN123456789',
        '2024-01-15',
        '1500.00',
        'available',
        'good',
        'New laptop for engineering team'
      ]
    },
    employees: {
      headers: ['name', 'email', 'department', 'location', 'status'],
      example: [
        'John Doe',
        'john.doe@company.com',
        'IT',
        'New York Office',
        'active'
      ]
    }
  };
  
  if (!templates[type]) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  const template = templates[type];
  const csvRows = [
    template.headers.join(','),
    template.example.map(val => `"${val}"`).join(',')
  ];
  
  const csv = csvRows.join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${type}_template.csv"`);
  res.send(csv);
});

module.exports = router;
