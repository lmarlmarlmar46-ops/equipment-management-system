const express = require('express');
const router = express.Router();
const db = require('../database');

// Get dashboard statistics
router.get('/stats', (req, res) => {
  const stats = {};
  
  // Get total equipment count
  db.get('SELECT COUNT(*) as count FROM equipment', [], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    stats.totalEquipment = result.count;
    
    // Get available equipment count
    db.get('SELECT COUNT(*) as count FROM equipment WHERE status = ?', ['available'], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      stats.availableEquipment = result.count;
      
      // Get allocated equipment count
      db.get('SELECT COUNT(*) as count FROM equipment WHERE status = ?', ['allocated'], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        stats.allocatedEquipment = result.count;
        
        // Get total employees count
        db.get('SELECT COUNT(*) as count FROM employees WHERE status = ?', ['active'], (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          stats.activeEmployees = result.count;
          
          // Get active allocations count
          db.get('SELECT COUNT(*) as count FROM allocations WHERE status = ?', ['active'], (err, result) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            stats.activeAllocations = result.count;
            
            // Get equipment by category
            db.all('SELECT category, COUNT(*) as count FROM equipment GROUP BY category', [], (err, categories) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              stats.equipmentByCategory = categories;
              
              res.json(stats);
            });
          });
        });
      });
    });
  });
});

module.exports = router;
