const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');

// Get all equipment
router.get('/', (req, res) => {
  const { status } = req.query;
  
  if (status) {
    Equipment.getByStatus(status, (err, equipment) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(equipment);
    });
  } else {
    Equipment.getAll((err, equipment) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(equipment);
    });
  }
});

// Get available equipment
router.get('/available', (req, res) => {
  Equipment.getAvailable((err, equipment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(equipment);
  });
});

// Get equipment by ID
router.get('/:id', (req, res) => {
  Equipment.getById(req.params.id, (err, equipment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(equipment);
  });
});

// Create new equipment
router.post('/', (req, res) => {
  Equipment.create(req.body, (err, equipment) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json(equipment);
  });
});

// Update equipment
router.put('/:id', (req, res) => {
  Equipment.update(req.params.id, req.body, (err, equipment) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(equipment);
  });
});

// Delete equipment
router.delete('/:id', (req, res) => {
  Equipment.delete(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Equipment deleted successfully' });
  });
});

module.exports = router;
