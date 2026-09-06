const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { calculateDepreciation, generateDepreciationSchedule } = require('../utils/depreciation');

// Calculate depreciation for a specific equipment
router.get('/equipment/:id', authenticateToken, (req, res) => {
  const { method = 'straight-line', useful_life, salvage_value } = req.query;
  
  db.get('SELECT * FROM equipment WHERE id = ?', [req.params.id], (err, equipment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    if (!equipment.purchase_price || !equipment.purchase_date) {
      return res.status(400).json({ 
        error: 'Equipment must have purchase_price and purchase_date for depreciation calculation' 
      });
    }
    
    // Default useful life by category (in years)
    const defaultUsefulLife = {
      'Computers': 3,
      'Laptops': 3,
      'Monitors': 5,
      'Printers': 5,
      'Phones': 2,
      'Tablets': 3,
      'Accessories': 2,
      'Furniture': 7,
      'Vehicles': 5
    };
    
    const usefulLifeYears = parseFloat(useful_life) || defaultUsefulLife[equipment.category] || 5;
    const salvageVal = parseFloat(salvage_value) || equipment.purchase_price * 0.1;
    
    try {
      const depreciation = calculateDepreciation(
        equipment.purchase_price,
        salvageVal,
        usefulLifeYears,
        equipment.purchase_date,
        method
      );
      
      res.json({
        equipment: {
          id: equipment.id,
          name: equipment.name,
          category: equipment.category,
          serial_number: equipment.serial_number
        },
        depreciation
      });
    } catch (error) {
      res.status(500).json({ error: 'Depreciation calculation failed' });
    }
  });
});

// Get depreciation schedule for equipment
router.get('/equipment/:id/schedule', authenticateToken, (req, res) => {
  const { method = 'straight-line', useful_life, salvage_value } = req.query;
  
  db.get('SELECT * FROM equipment WHERE id = ?', [req.params.id], (err, equipment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    if (!equipment.purchase_price || !equipment.purchase_date) {
      return res.status(400).json({ 
        error: 'Equipment must have purchase_price and purchase_date for depreciation schedule' 
      });
    }
    
    const defaultUsefulLife = {
      'Computers': 3,
      'Laptops': 3,
      'Monitors': 5,
      'Printers': 5,
      'Phones': 2,
      'Tablets': 3,
      'Accessories': 2,
      'Furniture': 7,
      'Vehicles': 5
    };
    
    const usefulLifeYears = parseFloat(useful_life) || defaultUsefulLife[equipment.category] || 5;
    const salvageVal = parseFloat(salvage_value) || equipment.purchase_price * 0.1;
    
    try {
      const schedule = generateDepreciationSchedule(
        equipment.purchase_price,
        salvageVal,
        usefulLifeYears,
        equipment.purchase_date,
        method
      );
      
      res.json({
        equipment: {
          id: equipment.id,
          name: equipment.name,
          category: equipment.category
        },
        method,
        usefulLifeYears,
        salvageValue: salvageVal,
        schedule
      });
    } catch (error) {
      res.status(500).json({ error: 'Schedule generation failed' });
    }
  });
});

// Bulk depreciation report for all equipment
router.get('/report', authenticateToken, authorizeRole('admin', 'manager'), (req, res) => {
  const { method = 'straight-line', category } = req.query;
  
  let query = 'SELECT * FROM equipment WHERE purchase_price IS NOT NULL AND purchase_date IS NOT NULL';
  const params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  db.all(query, params, (err, equipmentList) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const defaultUsefulLife = {
      'Computers': 3,
      'Laptops': 3,
      'Monitors': 5,
      'Printers': 5,
      'Phones': 2,
      'Tablets': 3,
      'Accessories': 2,
      'Furniture': 7,
      'Vehicles': 5
    };
    
    const depreciationReport = equipmentList.map(equipment => {
      const usefulLifeYears = defaultUsefulLife[equipment.category] || 5;
      const salvageVal = equipment.purchase_price * 0.1;
      
      try {
        const depreciation = calculateDepreciation(
          equipment.purchase_price,
          salvageVal,
          usefulLifeYears,
          equipment.purchase_date,
          method
        );
        
        return {
          equipment_id: equipment.id,
          name: equipment.name,
          category: equipment.category,
          serial_number: equipment.serial_number,
          ...depreciation
        };
      } catch (error) {
        return {
          equipment_id: equipment.id,
          name: equipment.name,
          error: 'Calculation failed'
        };
      }
    });
    
    // Calculate totals
    const totals = {
      totalPurchaseValue: depreciationReport.reduce((sum, item) => sum + (item.purchasePrice || 0), 0),
      totalCurrentValue: depreciationReport.reduce((sum, item) => sum + (item.currentValue || 0), 0),
      totalDepreciation: depreciationReport.reduce((sum, item) => sum + (item.totalDepreciation || 0), 0),
      equipmentCount: depreciationReport.length
    };
    
    res.json({
      method,
      report: depreciationReport,
      totals: {
        ...totals,
        averageDepreciationRate: parseFloat(((totals.totalDepreciation / totals.totalPurchaseValue) * 100).toFixed(2))
      }
    });
  });
});

// Compare depreciation methods for equipment
router.get('/equipment/:id/compare', authenticateToken, (req, res) => {
  const { useful_life, salvage_value } = req.query;
  
  db.get('SELECT * FROM equipment WHERE id = ?', [req.params.id], (err, equipment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    if (!equipment.purchase_price || !equipment.purchase_date) {
      return res.status(400).json({ 
        error: 'Equipment must have purchase_price and purchase_date' 
      });
    }
    
    const usefulLifeYears = parseFloat(useful_life) || 5;
    const salvageVal = parseFloat(salvage_value) || equipment.purchase_price * 0.1;
    
    const methods = ['straight-line', 'declining-balance', 'sum-of-years'];
    const comparison = {};
    
    methods.forEach(method => {
      try {
        comparison[method] = calculateDepreciation(
          equipment.purchase_price,
          salvageVal,
          usefulLifeYears,
          equipment.purchase_date,
          method
        );
      } catch (error) {
        comparison[method] = { error: 'Calculation failed' };
      }
    });
    
    res.json({
      equipment: {
        id: equipment.id,
        name: equipment.name,
        category: equipment.category
      },
      comparison
    });
  });
});

module.exports = router;
