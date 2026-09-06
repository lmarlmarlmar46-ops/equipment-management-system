const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Employee submits equipment request
router.post('/request-equipment', authenticateToken, (req, res) => {
  const {
    equipment_type,
    justification,
    priority = 'medium',
    required_by_date
  } = req.body;

  if (!equipment_type || !justification) {
    return res.status(400).json({ error: 'Equipment type and justification are required' });
  }

  // Get employee_id from user
  db.get('SELECT employee_id FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || !user.employee_id) {
      return res.status(400).json({ error: 'User must be linked to an employee' });
    }

    const id = uuidv4();
    const created_at = new Date().toISOString();

    db.run(
      `INSERT INTO service_requests 
       (id, equipment_id, employee_id, issue_type, priority, description, status, created_at)
       VALUES (?, NULL, ?, 'equipment_request', ?, ?, 'pending', ?)`,
      [id, user.employee_id, priority, `Equipment Type: ${equipment_type}\nJustification: ${justification}\nRequired By: ${required_by_date || 'ASAP'}`, created_at],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // TODO: Send notification to IT team
        res.status(201).json({
          message: 'Equipment request submitted successfully',
          request_id: id,
          status: 'pending'
        });
      }
    );
  });
});

// IT: Get pending requests with inventory suggestions
router.get('/pending-requests', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  db.all(
    `SELECT 
       sr.id, sr.employee_id, sr.description, sr.priority, sr.status, sr.created_at,
       e.name as employee_name, e.email as employee_email, e.department
     FROM service_requests sr
     LEFT JOIN employees e ON sr.employee_id = e.id
     WHERE sr.issue_type = 'equipment_request' AND sr.status = 'pending'
     ORDER BY 
       CASE sr.priority 
         WHEN 'critical' THEN 1
         WHEN 'high' THEN 2
         WHEN 'medium' THEN 3
         ELSE 4
       END,
       sr.created_at ASC`,
    [],
    (err, requests) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // For each request, get suggested available equipment
      const requestsWithInventory = requests.map(request => {
        // Extract equipment type from description
        const match = request.description.match(/Equipment Type: ([^\n]+)/);
        const equipmentType = match ? match[1].trim() : '';

        return new Promise((resolve) => {
          if (equipmentType) {
            db.all(
              `SELECT id, name, category, serial_number, condition
               FROM equipment
               WHERE status = 'available' 
               AND (category LIKE ? OR name LIKE ?)
               LIMIT 5`,
              [`%${equipmentType}%`, `%${equipmentType}%`],
              (err, available) => {
                resolve({
                  ...request,
                  equipment_type: equipmentType,
                  available_equipment: available || []
                });
              }
            );
          } else {
            resolve({ ...request, available_equipment: [] });
          }
        });
      });

      Promise.all(requestsWithInventory).then(results => {
        res.json(results);
      });
    }
  );
});

// IT: Approve request and create allocation in one step
router.post('/approve-and-allocate', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const {
    service_request_id,
    equipment_id,
    expected_return_date,
    notes
  } = req.body;

  if (!service_request_id || !equipment_id || !expected_return_date) {
    return res.status(400).json({ 
      error: 'Service request ID, equipment ID, and expected return date are required' 
    });
  }

  // Start transaction-like process
  // 1. Get service request details
  db.get('SELECT * FROM service_requests WHERE id = ?', [service_request_id], (err, request) => {
    if (err || !request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    // 2. Check equipment is available
    db.get('SELECT * FROM equipment WHERE id = ? AND status = ?', [equipment_id, 'available'], (err, equipment) => {
      if (err || !equipment) {
        return res.status(400).json({ error: 'Equipment not available' });
      }

      const allocation_id = uuidv4();
      const allocated_date = new Date().toISOString().split('T')[0];
      const created_at = new Date().toISOString();

      // 3. Create allocation
      db.run(
        `INSERT INTO allocations 
         (id, equipment_id, employee_id, allocated_date, expected_return_date, status, notes, created_at)
         VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
        [allocation_id, equipment_id, request.employee_id, allocated_date, expected_return_date, notes || 'Issued via service request', created_at],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create allocation: ' + err.message });
          }

          // 4. Update equipment status
          db.run('UPDATE equipment SET status = ? WHERE id = ?', ['allocated', equipment_id], (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to update equipment status' });
            }

            // 5. Update service request status
            db.run(
              'UPDATE service_requests SET status = ?, assigned_to = ?, resolved_at = ? WHERE id = ?',
              ['resolved', req.user.id, new Date().toISOString(), service_request_id],
              (err) => {
                if (err) {
                  return res.status(500).json({ error: 'Failed to update service request' });
                }

                // TODO: Send notification to employee
                res.json({
                  message: 'Request approved and equipment allocated successfully',
                  allocation_id,
                  service_request_id,
                  equipment_id
                });
              }
            );
          });
        }
      );
    });
  });
});

// Employee: Initiate return
router.post('/initiate-return', authenticateToken, (req, res) => {
  const { allocation_id, notes } = req.body;

  if (!allocation_id) {
    return res.status(400).json({ error: 'Allocation ID is required' });
  }

  // Verify allocation belongs to user's employee record
  db.get('SELECT employee_id FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'User not found' });
    }

    db.get(
      'SELECT * FROM allocations WHERE id = ? AND employee_id = ? AND status = ?',
      [allocation_id, user.employee_id, 'active'],
      (err, allocation) => {
        if (err || !allocation) {
          return res.status(404).json({ error: 'Active allocation not found' });
        }

        // Mark as return initiated (IT still needs to process)
        db.run(
          'UPDATE allocations SET notes = ?, status = ? WHERE id = ?',
          [`${allocation.notes || ''}\n\n[RETURN INITIATED] ${notes || 'Employee requested return'}`, 'return_pending', allocation_id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // TODO: Notify IT team
            res.json({
              message: 'Return initiated. Please bring equipment to IT department.',
              allocation_id
            });
          }
        );
      }
    );
  });
});

// IT: Process return
router.post('/process-return', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const {
    allocation_id,
    condition_notes,
    requires_maintenance = false
  } = req.body;

  if (!allocation_id) {
    return res.status(400).json({ error: 'Allocation ID is required' });
  }

  const actual_return_date = new Date().toISOString().split('T')[0];

  db.get('SELECT * FROM allocations WHERE id = ?', [allocation_id], (err, allocation) => {
    if (err || !allocation) {
      return res.status(404).json({ error: 'Allocation not found' });
    }

    // Update allocation
    db.run(
      `UPDATE allocations 
       SET actual_return_date = ?, status = 'returned', notes = ?
       WHERE id = ?`,
      [actual_return_date, `${allocation.notes || ''}\n\n[RETURNED] ${condition_notes || 'Equipment returned in good condition'}`, allocation_id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Update equipment status
        const newStatus = requires_maintenance ? 'maintenance' : 'available';
        db.run('UPDATE equipment SET status = ? WHERE id = ?', [newStatus, allocation.equipment_id], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to update equipment status' });
          }

          res.json({
            message: 'Return processed successfully',
            allocation_id,
            equipment_status: newStatus,
            returned_date: actual_return_date
          });
        });
      }
    );
  });
});

// Dashboard: Workflow overview
router.get('/dashboard-overview', authenticateToken, (req, res) => {
  const stats = {};

  Promise.all([
    // Pending requests
    new Promise((resolve) => {
      db.get(
        `SELECT COUNT(*) as count FROM service_requests 
         WHERE issue_type = 'equipment_request' AND status = 'pending'`,
        [],
        (err, result) => resolve({ pending_requests: result ? result.count : 0 })
      );
    }),
    // Active allocations
    new Promise((resolve) => {
      db.get(
        'SELECT COUNT(*) as count FROM allocations WHERE status = ?',
        ['active'],
        (err, result) => resolve({ active_allocations: result ? result.count : 0 })
      );
    }),
    // Overdue equipment
    new Promise((resolve) => {
      const today = new Date().toISOString().split('T')[0];
      db.get(
        'SELECT COUNT(*) as count FROM allocations WHERE status = ? AND expected_return_date < ?',
        ['active', today],
        (err, result) => resolve({ overdue_count: result ? result.count : 0 })
      );
    }),
    // Returns pending processing
    new Promise((resolve) => {
      db.get(
        'SELECT COUNT(*) as count FROM allocations WHERE status = ?',
        ['return_pending'],
        (err, result) => resolve({ returns_pending: result ? result.count : 0 })
      );
    }),
    // Available equipment
    new Promise((resolve) => {
      db.get(
        'SELECT COUNT(*) as count FROM equipment WHERE status = ?',
        ['available'],
        (err, result) => resolve({ available_equipment: result ? result.count : 0 })
      );
    })
  ]).then(results => {
    results.forEach(stat => Object.assign(stats, stat));
    res.json(stats);
  });
});

module.exports = router;
