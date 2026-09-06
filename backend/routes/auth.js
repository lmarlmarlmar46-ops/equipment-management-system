const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'employee', employee_id } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const id = uuidv4();
      const created_at = new Date().toISOString();

      db.run(
        `INSERT INTO users (id, username, email, password_hash, role, employee_id, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
        [id, username, email, password_hash, role, employee_id || null, created_at, created_at],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Generate JWT token
          const token = jwt.sign(
            { id, username, email, role },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.status(201).json({
            message: 'User registered successfully',
            user: { id, username, email, role },
            token
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

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
    db.run('UPDATE users SET last_login = ? WHERE id = ?', [last_login, user.id]);

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
  });
});

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  db.get(
    `SELECT id, username, email, role, employee_id, status, last_login, created_at 
     FROM users WHERE id = ?`,
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    }
  );
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    db.run('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [password_hash, new Date().toISOString(), req.user.id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({ message: 'Password changed successfully' });
      }
    );
  });
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', authenticateToken, (req, res) => {
  // In a production system, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
