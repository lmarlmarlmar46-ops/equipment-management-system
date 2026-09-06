const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all service requests
router.get('/', authenticateToken, (req, res) => {
  const { status, priority, employee_id, equipment_id } = req.query;
  
  let query = `
    SELECT sr.*, 
           e.name as employee_name, e.email as employee_email,
           eq.name as equipment_name, eq.serial_number,
           u.username as assigned_to_name
    FROM service_requests sr
    LEFT JOIN employees e ON sr.employee_id = e.id
    LEFT JOIN equipment eq ON sr.equipment_id = eq.id
    LEFT JOIN users u ON sr.assigned_to = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND sr.status = ?';
    params.push(status);
  }

  if (priority) {
    query += ' AND sr.priority = ?';
    params.push(priority);
  }

  if (employee_id) {
    query += ' AND sr.employee_id = ?';
    params.push(employee_id);
  }

  if (equipment_id) {
    query += ' AND sr.equipment_id = ?';
    params.push(equipment_id);
  }

  query += ' ORDER BY sr.created_at DESC';

  db.all(query, params, (err, requests) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(requests);
  });
});

// Get service request by ID
router.get('/:id', authenticateToken, (req, res) => {
  db.get(
    `SELECT sr.*, 
            e.name as employee_name, e.email as employee_email, e.department,
            eq.name as equipment_name, eq.serial_number, eq.category,
            u.username as assigned_to_name
     FROM service_requests sr
     LEFT JOIN employees e ON sr.employee_id = e.id
     LEFT JOIN equipment eq ON sr.equipment_id = eq.id
     LEFT JOIN users u ON sr.assigned_to = u.id
     WHERE sr.id = ?`,
    [req.params.id],
    (err, request) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!request) {
        return res.status(404).json({ error: 'Service request not found' });
      }
      res.json(request);
    }
  );
});

// Create service request
router.post('/', authenticateToken, (req, res) => {
  const {
    equipment_id,
    employee_id,
    issue_type,
    priority = 'medium',
    description
  } = req.body;

  if (!equipment_id || !employee_id || !issue_type || !description) {
    return res.status(400).json({ 
      error: 'Equipment ID, employee ID, issue type, and description are required' 
    });
  }

  const id = uuidv4();
  const created_at = new Date().toISOString();

  db.run(
    `INSERT INTO service_requests 
     (id, equipment_id, employee_id, issue_type, priority, description, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'open', ?)`,
    [id, equipment_id, employee_id, issue_type, priority, description, created_at],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get('SELECT * FROM service_requests WHERE id = ?', [id], (err, request) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(request);
      });
    }
  );
});

// Assign service request
router.patch('/:id/assign', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const { assigned_to } = req.body;

  db.run(
    'UPDATE service_requests SET assigned_to = ?, status = ? WHERE id = ?',
    [assigned_to, 'assigned', req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Service request not found' });
      }

      db.get('SELECT * FROM service_requests WHERE id = ?', [req.params.id], (err, request) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(request);
      });
    }
  );
});

// Resolve service request
router.patch('/:id/resolve', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const { resolution_notes } = req.body;
  const resolved_at = new Date().toISOString();

  db.run(
    'UPDATE service_requests SET status = ?, resolution_notes = ?, resolved_at = ? WHERE id = ?',
    ['resolved', resolution_notes, resolved_at, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Service request not found' });
      }

      db.get('SELECT * FROM service_requests WHERE id = ?', [req.params.id], (err, request) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(request);
      });
    }
  );
});

// Update service request
router.put('/:id', authenticateToken, (req, res) => {
  const {
    issue_type,
    priority,
    description,
    status
  } = req.body;

  db.run(
    `UPDATE service_requests 
     SET issue_type = ?, priority = ?, description = ?, status = ?
     WHERE id = ?`,
    [issue_type, priority, description, status, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Service request not found' });
      }

      db.get('SELECT * FROM service_requests WHERE id = ?', [req.params.id], (err, request) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(request);
      });
    }
  );
});

// Delete service request
router.delete('/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  db.run('DELETE FROM service_requests WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    res.json({ message: 'Service request deleted successfully' });
  });
});

module.exports = router;
