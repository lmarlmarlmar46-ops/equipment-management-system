const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Get all employees
router.get('/', (req, res) => {
  Employee.getAll((err, employees) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(employees);
  });
});

// Get employee by ID
router.get('/:id', (req, res) => {
  Employee.getById(req.params.id, (err, employee) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  });
});

// Get employee with their allocations
router.get('/:id/allocations', (req, res) => {
  Employee.getWithAllocations(req.params.id, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(data);
  });
});

// Create new employee
router.post('/', (req, res) => {
  Employee.create(req.body, (err, employee) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json(employee);
  });
});

// Update employee
router.put('/:id', (req, res) => {
  Employee.update(req.params.id, req.body, (err, employee) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  });
});

// Delete employee
router.delete('/:id', (req, res) => {
  Employee.delete(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Employee deleted successfully' });
  });
});

module.exports = router;
