const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all reservations
router.get('/', authenticateToken, (req, res) => {
  const { employee_id, equipment_id, status } = req.query;
  
  let query = `
    SELECT r.*, 
           e.name as employee_name, e.department,
           eq.name as equipment_name, eq.serial_number, eq.category
    FROM reservations r
    LEFT JOIN employees e ON r.employee_id = e.id
    LEFT JOIN equipment eq ON r.equipment_id = eq.id
    WHERE 1=1
  `;
  const params = [];

  if (employee_id) {
    query += ' AND r.employee_id = ?';
    params.push(employee_id);
  }

  if (equipment_id) {
    query += ' AND r.equipment_id = ?';
    params.push(equipment_id);
  }

  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  }

  query += ' ORDER BY r.start_date DESC';

  db.all(query, params, (err, reservations) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(reservations);
  });
});

// Get reservation by ID
router.get('/:id', authenticateToken, (req, res) => {
  db.get(
    `SELECT r.*, 
            e.name as employee_name, e.email as employee_email, e.department,
            eq.name as equipment_name, eq.serial_number, eq.category, eq.status as equipment_status
     FROM reservations r
     LEFT JOIN employees e ON r.employee_id = e.id
     LEFT JOIN equipment eq ON r.equipment_id = eq.id
     WHERE r.id = ?`,
    [req.params.id],
    (err, reservation) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }
      res.json(reservation);
    }
  );
});

// Create reservation
router.post('/', authenticateToken, (req, res) => {
  const {
    equipment_id,
    employee_id,
    start_date,
    end_date,
    purpose,
    notes
  } = req.body;

  if (!equipment_id || !employee_id || !start_date || !end_date) {
    return res.status(400).json({ 
      error: 'Equipment ID, employee ID, start date, and end date are required' 
    });
  }

  // Check for conflicts
  db.all(
    `SELECT * FROM reservations 
     WHERE equipment_id = ? 
     AND status IN ('pending', 'approved')
     AND (
       (start_date <= ? AND end_date >= ?) OR
       (start_date <= ? AND end_date >= ?) OR
       (start_date >= ? AND end_date <= ?)
     )`,
    [equipment_id, start_date, start_date, end_date, end_date, start_date, end_date],
    (err, conflicts) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (conflicts.length > 0) {
        return res.status(409).json({ 
          error: 'Equipment is already reserved for this time period',
          conflicts
        });
      }

      const id = uuidv4();
      const created_at = new Date().toISOString();

      db.run(
        `INSERT INTO reservations 
         (id, equipment_id, employee_id, start_date, end_date, status, purpose, notes, created_at)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
        [id, equipment_id, employee_id, start_date, end_date, purpose, notes, created_at],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          db.get('SELECT * FROM reservations WHERE id = ?', [id], (err, reservation) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(201).json(reservation);
          });
        }
      );
    }
  );
});

// Update reservation status
router.patch('/:id/status', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE reservations SET status = ? WHERE id = ?',
    [status, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      db.get('SELECT * FROM reservations WHERE id = ?', [req.params.id], (err, reservation) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(reservation);
      });
    }
  );
});

// Delete reservation
router.delete('/:id', authenticateToken, (req, res) => {
  // Users can delete their own reservations, admins can delete any
  let query = 'DELETE FROM reservations WHERE id = ?';
  const params = [req.params.id];

  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    query = `DELETE FROM reservations WHERE id = ? AND employee_id = (
      SELECT employee_id FROM users WHERE id = ?
    )`;
    params.push(req.user.id);
  }

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Reservation not found or unauthorized' });
    }

    res.json({ message: 'Reservation deleted successfully' });
  });
});

module.exports = router;
