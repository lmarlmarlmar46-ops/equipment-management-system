const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get user notifications
router.get('/', authenticateToken, (req, res) => {
  const { unread_only } = req.query;
  
  let query = 'SELECT * FROM notifications WHERE user_id = ?';
  const params = [req.user.id];

  if (unread_only === 'true') {
    query += ' AND is_read = 0';
  }

  query += ' ORDER BY created_at DESC LIMIT 50';

  db.all(query, params, (err, notifications) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(notifications);
  });
});

// Get unread count
router.get('/unread-count', authenticateToken, (req, res) => {
  db.get(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [req.user.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ count: result.count });
    }
  );
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, (req, res) => {
  db.run(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ message: 'Notification marked as read' });
    }
  );
});

// Mark all notifications as read
router.post('/mark-all-read', authenticateToken, (req, res) => {
  db.run(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
    [req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: `${this.changes} notifications marked as read` });
    }
  );
});

// Delete notification
router.delete('/:id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ message: 'Notification deleted' });
    }
  );
});

// Create notification (internal use by other routes)
const createNotification = (user_id, type, title, message, action_url = null) => {
  const id = uuidv4();
  const created_at = new Date().toISOString();

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO notifications (id, user_id, type, title, message, is_read, action_url, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [id, user_id, type, title, message, action_url, created_at],
      function (err) {
        if (err) reject(err);
        else resolve({ id, user_id, type, title, message, action_url, created_at });
      }
    );
  });
};

module.exports = router;
module.exports.createNotification = createNotification;
