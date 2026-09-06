const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Equipment utilization report
router.get('/equipment-utilization', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const { start_date, end_date } = req.query;
  
  db.all(
    `SELECT 
       e.id, e.name, e.category, e.serial_number,
       COUNT(a.id) as allocation_count,
       SUM(CASE WHEN a.status = 'active' THEN 1 ELSE 0 END) as active_allocations,
       AVG(julianday(COALESCE(a.actual_return_date, date('now'))) - julianday(a.allocated_date)) as avg_allocation_days
     FROM equipment e
     LEFT JOIN allocations a ON e.id = a.equipment_id
     ${start_date ? "WHERE a.allocated_date >= ?" : ""}
     ${end_date ? (start_date ? "AND" : "WHERE") + " a.allocated_date <= ?" : ""}
     GROUP BY e.id
     ORDER BY allocation_count DESC`,
    [start_date, end_date].filter(Boolean),
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

// Department equipment report
router.get('/by-department', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  db.all(
    `SELECT 
       emp.department,
       COUNT(DISTINCT a.equipment_id) as equipment_count,
       COUNT(a.id) as total_allocations,
       SUM(CASE WHEN a.status = 'active' THEN 1 ELSE 0 END) as active_allocations
     FROM allocations a
     JOIN employees emp ON a.employee_id = emp.id
     WHERE emp.department IS NOT NULL
     GROUP BY emp.department
     ORDER BY equipment_count DESC`,
    [],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

// Cost analysis report
router.get('/cost-analysis', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const { start_date, end_date } = req.query;
  
  Promise.all([
    // Equipment purchase costs
    new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           category,
           COUNT(*) as count,
           SUM(purchase_price) as total_cost,
           AVG(purchase_price) as avg_cost,
           MIN(purchase_price) as min_cost,
           MAX(purchase_price) as max_cost
         FROM equipment
         WHERE purchase_price IS NOT NULL
         ${start_date ? "AND purchase_date >= ?" : ""}
         ${end_date ? (start_date ? "AND" : "WHERE") + " purchase_date <= ?" : ""}
         GROUP BY category`,
        [start_date, end_date].filter(Boolean),
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    }),
    // Maintenance costs
    new Promise((resolve, reject) => {
      db.get(
        `SELECT 
           COUNT(*) as maintenance_count,
           SUM(cost) as total_maintenance_cost,
           AVG(cost) as avg_maintenance_cost
         FROM maintenance_logs
         WHERE cost IS NOT NULL
         ${start_date ? "AND performed_date >= ?" : ""}
         ${end_date ? (start_date ? "AND" : "WHERE") + " performed_date <= ?" : ""}`,
        [start_date, end_date].filter(Boolean),
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    })
  ])
  .then(([equipmentCosts, maintenanceCosts]) => {
    res.json({
      equipmentCosts,
      maintenanceCosts,
      summary: {
        totalEquipmentCost: equipmentCosts.reduce((sum, cat) => sum + (cat.total_cost || 0), 0),
        totalMaintenanceCost: maintenanceCosts.total_maintenance_cost || 0
      }
    });
  })
  .catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// Allocation history report
router.get('/allocation-history', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const { equipment_id, employee_id, start_date, end_date } = req.query;
  
  let query = `
    SELECT 
      a.*,
      e.name as employee_name, e.department,
      eq.name as equipment_name, eq.serial_number, eq.category
    FROM allocations a
    LEFT JOIN employees e ON a.employee_id = e.id
    LEFT JOIN equipment eq ON a.equipment_id = eq.id
    WHERE 1=1
  `;
  const params = [];

  if (equipment_id) {
    query += ' AND a.equipment_id = ?';
    params.push(equipment_id);
  }

  if (employee_id) {
    query += ' AND a.employee_id = ?';
    params.push(employee_id);
  }

  if (start_date) {
    query += ' AND a.allocated_date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND a.allocated_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY a.allocated_date DESC';

  db.all(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Overdue equipment report
router.get('/overdue-equipment', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  db.all(
    `SELECT 
       a.*,
       e.name as employee_name, e.email as employee_email, e.department,
       eq.name as equipment_name, eq.serial_number, eq.category,
       julianday(?) - julianday(a.expected_return_date) as days_overdue
     FROM allocations a
     LEFT JOIN employees e ON a.employee_id = e.id
     LEFT JOIN equipment eq ON a.equipment_id = eq.id
     WHERE a.status = 'active' 
     AND a.expected_return_date < ?
     ORDER BY days_overdue DESC`,
    [today, today],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

// Equipment lifecycle report
router.get('/equipment-lifecycle', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  db.all(
    `SELECT 
       e.id, e.name, e.category, e.serial_number, e.purchase_date, e.status, e.condition,
       COUNT(a.id) as total_allocations,
       COUNT(ml.id) as maintenance_count,
       SUM(ml.cost) as total_maintenance_cost,
       julianday(date('now')) - julianday(e.purchase_date) as age_days
     FROM equipment e
     LEFT JOIN allocations a ON e.id = a.equipment_id
     LEFT JOIN maintenance_logs ml ON e.id = ml.equipment_id
     GROUP BY e.id
     ORDER BY age_days DESC`,
    [],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

module.exports = router;
