const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../seed');

// Admin endpoint to seed database
// GET /api/seed/run
router.get('/run', async (req, res) => {
  try {
    console.log('🌱 Manual seed triggered via API');
    
    // Check if database already has data
    const db = require('../database-pg');
    const existingUsers = await db.all('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers[0].count > 0) {
      return res.json({
        success: false,
        message: 'Database already contains data',
        info: 'To reseed, first clear the database manually',
        existingRecords: existingUsers[0].count
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
    
    const users = await db.all('SELECT COUNT(*) as count FROM users');
    const employees = await db.all('SELECT COUNT(*) as count FROM employees');
    const equipment = await db.all('SELECT COUNT(*) as count FROM equipment');
    const allocations = await db.all('SELECT COUNT(*) as count FROM allocations');
    
    const isEmpty = users[0].count === 0;
    
    res.json({
      success: true,
      isEmpty: isEmpty,
      counts: {
        users: users[0].count,
        employees: employees[0].count,
        equipment: equipment[0].count,
        allocations: allocations[0].count
      },
      message: isEmpty ? 'Database is empty - ready to seed' : 'Database contains data'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Could not check database status - may not be initialized yet'
    });
  }
});

module.exports = router;
