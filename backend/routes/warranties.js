const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all warranties
router.get('/', authenticateToken, (req, res) => {
  const { equipment_id, active_only } = req.query;
  
  let query = `
    SELECT w.*, e.name as equipment_name, e.serial_number
    FROM warranties w
    LEFT JOIN equipment e ON w.equipment_id = e.id
    WHERE 1=1
  `;
  const params = [];

  if (equipment_id) {
    query += ' AND w.equipment_id = ?';
    params.push(equipment_id);
  }

  if (active_only === 'true') {
    const today = new Date().toISOString().split('T')[0];
    query += ' AND w.end_date >= ?';
    params.push(today);
  }

  query += ' ORDER BY w.end_date DESC';

  db.all(query, params, (err, warranties) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(warranties);
  });
});

// Get warranty by ID
router.get('/:id', authenticateToken, (req, res) => {
  db.get(
    `SELECT w.*, e.name as equipment_name, e.serial_number
     FROM warranties w
     LEFT JOIN equipment e ON w.equipment_id = e.id
     WHERE w.id = ?`,
    [req.params.id],
    (err, warranty) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!warranty) {
        return res.status(404).json({ error: 'Warranty not found' });
      }
      res.json(warranty);
    }
  );
});

// Create warranty
router.post('/', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const {
    equipment_id,
    provider,
    start_date,
    end_date,
    coverage_details,
    contact_info
  } = req.body;

  if (!equipment_id || !start_date || !end_date) {
    return res.status(400).json({ 
      error: 'Equipment ID, start date, and end date are required' 
    });
  }

  const id = uuidv4();
  const created_at = new Date().toISOString();

  db.run(
    `INSERT INTO warranties 
     (id, equipment_id, provider, start_date, end_date, coverage_details, contact_info, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, equipment_id, provider, start_date, end_date, coverage_details, contact_info, created_at],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get('SELECT * FROM warranties WHERE id = ?', [id], (err, warranty) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(warranty);
      });
    }
  );
});

// Update warranty
router.put('/:id', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const {
    provider,
    start_date,
    end_date,
    coverage_details,
    contact_info
  } = req.body;

  db.run(
    `UPDATE warranties 
     SET provider = ?, start_date = ?, end_date = ?, coverage_details = ?, contact_info = ?
     WHERE id = ?`,
    [provider, start_date, end_date, coverage_details, contact_info, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Warranty not found' });
      }

      db.get('SELECT * FROM warranties WHERE id = ?', [req.params.id], (err, warranty) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(warranty);
      });
    }
  );
});

// Delete warranty
router.delete('/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  db.run('DELETE FROM warranties WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Warranty not found' });
    }

    res.json({ message: 'Warranty deleted successfully' });
  });
});

// Get expiring warranties
router.get('/expiring/soon', authenticateToken, (req, res) => {
  const { days = 30 } = req.query;
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + parseInt(days));

  const todayStr = today.toISOString().split('T')[0];
  const futureDateStr = futureDate.toISOString().split('T')[0];

  db.all(
    `SELECT w.*, e.name as equipment_name, e.serial_number
     FROM warranties w
     LEFT JOIN equipment e ON w.equipment_id = e.id
     WHERE w.end_date BETWEEN ? AND ?
     ORDER BY w.end_date ASC`,
    [todayStr, futureDateStr],
    (err, warranties) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(warranties);
    }
  );
});

module.exports = router;
