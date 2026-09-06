const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../seed');

// Admin endpoint to seed database
// GET /api/seed/run
router.get('/run', async (req, res) => {
  try {
    console.log('🌱 Manual seed triggered via API');
    
    const db = require('../database-pg');
    
    // Check if PostgreSQL is configured
    if (!db.pool) {
      return res.status(400).json({
        success: false,
        message: 'PostgreSQL not configured',
        error: 'DATABASE_URL environment variable not set',
        hint: 'Add DATABASE_URL to your Railway backend service variables'
      });
    }
    
    // Check if database already has data
    const existingUsers = await db.query('SELECT COUNT(*) as count FROM users');
    
    if (parseInt(existingUsers.rows[0].count) > 0) {
      return res.json({
        success: false,
        message: 'Database already contains data',
        info: 'To reseed, first clear the database manually',
        existingRecords: parseInt(existingUsers.rows[0].count)
      });
    }

    // Run seed
    await seedDatabase();
    
    res.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        employees: 5,
        users: 5,
        equipment: 8,
        allocations: 3,
        serviceRequests: 1
      },
      demoAccounts: {
        admin: 'admin@equiptrack.com / admin123',
        manager: 'manager@equiptrack.com / manager123',
        employee: 'employee@equiptrack.com / employee123'
      }
    });
  } catch (error) {
    console.error('❌ Seed error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Check database status
// GET /api/seed/status
router.get('/status', async (req, res) => {
  try {
    const db = require('../database-pg');
    
    // Check if pool exists
    if (!db.pool) {
      return res.json({
        success: false,
        message: 'PostgreSQL not configured. Set DATABASE_URL environment variable.',
        usingFallback: 'SQLite'
      });
    }
    
    const users = await db.query('SELECT COUNT(*) as count FROM users');
    const employees = await db.query('SELECT COUNT(*) as count FROM employees');
    const equipment = await db.query('SELECT COUNT(*) as count FROM equipment');
    const allocations = await db.query('SELECT COUNT(*) as count FROM allocations');
    
    const isEmpty = parseInt(users.rows[0].count) === 0;
    
    res.json({
      success: true,
      isEmpty: isEmpty,
      counts: {
        users: parseInt(users.rows[0].count),
        employees: parseInt(employees.rows[0].count),
        equipment: parseInt(equipment.rows[0].count),
        allocations: parseInt(allocations.rows[0].count)
      },
      database: 'PostgreSQL',
      message: isEmpty ? 'Database is empty - ready to seed' : 'Database contains data'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Could not check database status - may not be initialized yet',
      hint: 'Tables may need to be created. Try visiting /api/seed/run'
    });
  }
});

module.exports = router;
