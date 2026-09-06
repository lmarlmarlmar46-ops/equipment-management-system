const express = require('express');
const router = express.Router();
const db = require('../database-pg');

// Test endpoint to check database and users
router.get('/test', async (req, res) => {
  try {
    // Check if database is connected
    if (!db.pool) {
      return res.json({
        error: 'Database not connected',
        message: 'PostgreSQL pool is null'
      });
    }

    // Get all users (without passwords)
    const users = await db.query('SELECT id, username, email, role FROM users LIMIT 10');

    res.json({
      success: true,
      database: 'PostgreSQL',
      userCount: users.rows.length,
      users: users.rows,
      message: 'Database working! Users found.'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Error querying database'
    });
  }
});

// Test login with direct credentials
router.post('/test-login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Find user
    const result = await db.query('SELECT id, username, email, role, password_hash FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.json({
        found: false,
        message: 'No user with that email',
        email: email
      });
    }

    const user = result.rows[0];

    res.json({
      found: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      passwordHashExists: !!user.password_hash,
      passwordHashLength: user.password_hash ? user.password_hash.length : 0
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
