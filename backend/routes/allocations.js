const express = require('express');
const router = express.Router();
const Allocation = require('../models/Allocation');

// Get all allocations
router.get('/', (req, res) => {
  Allocation.getAll((err, allocations) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(allocations);
  });
});

// Get active allocations
router.get('/active', (req, res) => {
  Allocation.getActive((err, allocations) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(allocations);
  });
});

// Get allocation by ID
router.get('/:id', (req, res) => {
  Allocation.getById(req.params.id, (err, allocation) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!allocation) {
      return res.status(404).json({ error: 'Allocation not found' });
    }
    res.json(allocation);
  });
});

// Get allocations by employee
router.get('/employee/:employee_id', (req, res) => {
  Allocation.getByEmployee(req.params.employee_id, (err, allocations) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(allocations);
  });
});

// Get allocations by equipment
router.get('/equipment/:equipment_id', (req, res) => {
  Allocation.getByEquipment(req.params.equipment_id, (err, allocations) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(allocations);
  });
});

// Create new allocation
router.post('/', (req, res) => {
  Allocation.create(req.body, (err, allocation) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json(allocation);
  });
});

// Return equipment
router.post('/:id/return', (req, res) => {
  const { actual_return_date } = req.body;
  const returnDate = actual_return_date || new Date().toISOString().split('T')[0];
  
  Allocation.returnEquipment(req.params.id, returnDate, (err, allocation) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(allocation);
  });
});

module.exports = router;
