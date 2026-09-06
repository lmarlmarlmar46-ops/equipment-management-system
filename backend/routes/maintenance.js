const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all maintenance logs
router.get('/', authenticateToken, (req, res) => {
  const { equipment_id, start_date, end_date } = req.query;
  
  let query = `
    SELECT ml.*, e.name as equipment_name, e.serial_number
    FROM maintenance_logs ml
    LEFT JOIN equipment e ON ml.equipment_id = e.id
    WHERE 1=1
  `;
  const params = [];

  if (equipment_id) {
    query += ' AND ml.equipment_id = ?';
    params.push(equipment_id);
  }

  if (start_date) {
    query += ' AND ml.performed_date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND ml.performed_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY ml.performed_date DESC';

  db.all(query, params, (err, logs) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(logs);
  });
});

// Get maintenance log by ID
router.get('/:id', authenticateToken, (req, res) => {
  db.get(
    `SELECT ml.*, e.name as equipment_name, e.serial_number
     FROM maintenance_logs ml
     LEFT JOIN equipment e ON ml.equipment_id = e.id
     WHERE ml.id = ?`,
    [req.params.id],
    (err, log) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!log) {
        return res.status(404).json({ error: 'Maintenance log not found' });
      }
      res.json(log);
    }
  );
});

// Create maintenance log
router.post('/', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const {
    equipment_id,
    maintenance_type,
    description,
    cost,
    performed_date,
    performed_by,
    next_maintenance_date
  } = req.body;

  if (!equipment_id || !maintenance_type || !performed_date) {
    return res.status(400).json({ 
      error: 'Equipment ID, maintenance type, and performed date are required' 
    });
  }

  const id = uuidv4();
  const created_at = new Date().toISOString();

  db.run(
    `INSERT INTO maintenance_logs 
     (id, equipment_id, maintenance_type, description, cost, performed_date, 
      performed_by, next_maintenance_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, equipment_id, maintenance_type, description, cost, performed_date, 
     performed_by, next_maintenance_date, created_at],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get('SELECT * FROM maintenance_logs WHERE id = ?', [id], (err, log) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(log);
      });
    }
  );
});

// Update maintenance log
router.put('/:id', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const {
    maintenance_type,
    description,
    cost,
    performed_date,
    performed_by,
    next_maintenance_date
  } = req.body;

  db.run(
    `UPDATE maintenance_logs 
     SET maintenance_type = ?, description = ?, cost = ?, performed_date = ?,
         performed_by = ?, next_maintenance_date = ?
     WHERE id = ?`,
    [maintenance_type, description, cost, performed_date, performed_by, 
     next_maintenance_date, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Maintenance log not found' });
      }

      db.get('SELECT * FROM maintenance_logs WHERE id = ?', [req.params.id], (err, log) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(log);
      });
    }
  );
});

// Delete maintenance log
router.delete('/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  db.run('DELETE FROM maintenance_logs WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }

    res.json({ message: 'Maintenance log deleted successfully' });
  });
});

// Get upcoming maintenance
router.get('/upcoming/list', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  db.all(
    `SELECT ml.*, e.name as equipment_name, e.serial_number
     FROM maintenance_logs ml
     LEFT JOIN equipment e ON ml.equipment_id = e.id
     WHERE ml.next_maintenance_date IS NOT NULL 
     AND ml.next_maintenance_date >= ?
     ORDER BY ml.next_maintenance_date ASC
     LIMIT 50`,
    [today],
    (err, logs) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(logs);
    }
  );
});

module.exports = router;
