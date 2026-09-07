const express = require('express');
const router = express.Router();
const db = require('../database-pg');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all work assignments (admin/manager see all, employees see their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, employee_id } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    let query = `
      SELECT 
        wa.*,
        e.full_name as employee_name,
        e.email as employee_email,
        e.phone as employee_phone,
        e.department as employee_department,
        mgr.full_name as assigned_by_name
      FROM work_assignments wa
      LEFT JOIN employees e ON wa.assigned_to = e.id
      LEFT JOIN employees mgr ON wa.assigned_by = mgr.id
      WHERE 1=1
    `;
    const params = [];

    // If employee role, only show their assignments
    if (userRole === 'employee') {
      query += ` AND wa.assigned_to = $${params.length + 1}`;
      params.push(userId);
    } else if (employee_id) {
      // Admin/Manager filtering by specific employee
      query += ` AND wa.assigned_to = $${params.length + 1}`;
      params.push(employee_id);
    }

    if (status) {
      query += ` AND wa.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY wa.created_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching work assignments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get assignment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        wa.*,
        e.full_name as employee_name,
        e.email as employee_email,
        e.phone as employee_phone,
        e.department as employee_department,
        mgr.full_name as assigned_by_name
      FROM work_assignments wa
      LEFT JOIN employees e ON wa.assigned_to = e.id
      LEFT JOIN employees mgr ON wa.assigned_by = mgr.id
      WHERE wa.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Work assignment not found' });
    }

    // Employees can only view their own assignments
    if (req.user.role === 'employee' && result.rows[0].assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching work assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new work assignment (admin/manager only)
router.post('/', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const {
      assigned_to,
      task_description,
      department,
      location,
      priority,
      due_date,
      notes
    } = req.body;

    if (!assigned_to || !task_description) {
      return res.status(400).json({ error: 'assigned_to and task_description are required' });
    }

    // Check if employee exists
    const employeeCheck = await db.query(
      'SELECT id, full_name, email, available FROM employees WHERE id = $1',
      [assigned_to]
    );

    if (employeeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const result = await db.query(
      `INSERT INTO work_assignments (
        assigned_to, 
        assigned_by, 
        task_description, 
        department, 
        location, 
        priority, 
        due_date, 
        notes,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *`,
      [
        assigned_to,
        req.user.id,
        task_description,
        department || null,
        location || null,
        priority || 'medium',
        due_date || null,
        notes || null
      ]
    );

    res.status(201).json({
      assignment: result.rows[0],
      employee: employeeCheck.rows[0]
    });
  } catch (error) {
    console.error('Error creating work assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update assignment status - Employee accepts/rejects
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    const assignmentId = req.params.id;

    if (!['pending', 'accepted', 'rejected', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get current assignment
    const current = await db.query(
      'SELECT * FROM work_assignments WHERE id = $1',
      [assignmentId]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Employees can only update their own assignments
    if (req.user.role === 'employee' && current.rows[0].assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `UPDATE work_assignments 
       SET status = $1, 
           rejection_reason = $2,
           ${status === 'accepted' ? 'accepted_at = CURRENT_TIMESTAMP,' : ''}
           ${status === 'completed' ? 'completed_at = CURRENT_TIMESTAMP,' : ''}
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, rejection_reason || null, assignmentId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete assignment (admin/manager only)
router.delete('/:id', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM work_assignments WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics for dashboard
router.get('/stats/overview', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_assignments,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM work_assignments
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
