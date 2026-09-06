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


// Generate QR code for equipment
router.get('/:id/qrcode', async (req, res) => {
  try {
    db.get('SELECT * FROM equipment WHERE id = ?', [req.params.id], async (err, equipment) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!equipment) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      // Create QR code data with equipment details
      const qrData = JSON.stringify({
        id: equipment.id,
        name: equipment.name,
        serial_number: equipment.serial_number,
        category: equipment.category,
        url: `${req.protocol}://${req.get('host')}/equipment/${equipment.id}`
      });

      try {
        const qrCodeDataURL = await generateQRCode(qrData);
        res.json({
          equipment: {
            id: equipment.id,
            name: equipment.name,
            serial_number: equipment.serial_number
          },
          qrCode: qrCodeDataURL
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to generate QR code' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk generate QR codes
router.post('/bulk/qrcodes', async (req, res) => {
  const { equipment_ids } = req.body;

  if (!equipment_ids || !Array.isArray(equipment_ids)) {
    return res.status(400).json({ error: 'equipment_ids array is required' });
  }

  const placeholders = equipment_ids.map(() => '?').join(',');
  
  db.all(
    `SELECT * FROM equipment WHERE id IN (${placeholders})`,
    equipment_ids,
    async (err, equipmentList) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const qrCodes = await Promise.all(
        equipmentList.map(async (equipment) => {
          const qrData = JSON.stringify({
            id: equipment.id,
            name: equipment.name,
            serial_number: equipment.serial_number,
            category: equipment.category
          });

          try {
            const qrCodeDataURL = await generateQRCode(qrData);
            return {
              equipment_id: equipment.id,
              equipment_name: equipment.name,
              serial_number: equipment.serial_number,
              qrCode: qrCodeDataURL
            };
          } catch (error) {
            return {
              equipment_id: equipment.id,
              error: 'Failed to generate QR code'
            };
          }
        })
      );

      res.json(qrCodes);
    }
  );
});
