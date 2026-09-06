const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database-pg');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, employee_id } = req.body;
    
    // Force role to 'employee' for all registrations
    const role = 'employee';

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const id = uuidv4();
    const created_at = new Date().toISOString();

    await db.run(
      `INSERT INTO users (id, username, email, password_hash, role, employee_id, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8)`,
      [id, username, email, password_hash, role, employee_id || null, created_at, created_at]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id, username, email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully as employee',
      user: { id, username, email, role },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await db.get(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    const last_login = new Date().toISOString();
    await db.run('UPDATE users SET last_login = $1 WHERE id = $2', [last_login, user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.get(
      `SELECT id, username, email, role, employee_id, status, last_login, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user
    const user = await db.get('SELECT * FROM users WHERE id = $1', [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(current_password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const new_password_hash = await bcrypt.hash(new_password, 10);

    // Update password
    await db.run(
      'UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3',
      [new_password_hash, new Date().toISOString(), req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// Promote user (Admin/Manager only)
router.post('/promote', authenticateToken, async (req, res) => {
  try {
    // Check if requester is admin or manager
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ 
        error: 'Access denied. Only admins and managers can promote users.' 
      });
    }

    const { user_id, new_role } = req.body;

    if (!user_id || !new_role) {
      return res.status(400).json({ error: 'User ID and new role are required' });
    }

    // Validate new role
    const validRoles = ['employee', 'manager', 'admin'];
    if (!validRoles.includes(new_role)) {
      return res.status(400).json({ error: 'Invalid role. Must be: employee, manager, or admin' });
    }

    // Managers cannot promote to admin (only admins can)
    if (req.user.role === 'manager' && new_role === 'admin') {
      return res.status(403).json({ 
        error: 'Only admins can promote users to admin role' 
      });
    }

    // Get target user
    const targetUser = await db.get('SELECT id, username, email, role FROM users WHERE id = $1', [user_id]);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user role
    await db.run(
      'UPDATE users SET role = $1, updated_at = $2 WHERE id = $3',
      [new_role, new Date().toISOString(), user_id]
    );

    res.json({
      message: `User promoted successfully`,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        email: targetUser.email,
        old_role: targetUser.role,
        new_role: new_role
      },
      promoted_by: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Promote error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users (Admin/Manager only) - for managing promotions
router.get('/users', authenticateToken, async (req, res) => {
  try {
    // Check if requester is admin or manager
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ 
        error: 'Access denied. Only admins and managers can view all users.' 
      });
    }

    const users = await db.query(
      `SELECT id, username, email, role, status, employee_id, created_at, last_login 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json({
      users: users.rows,
      total: users.rows.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});
