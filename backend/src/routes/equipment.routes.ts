import { Router } from 'express';
import equipmentController from '../controllers/equipment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { body, query } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all equipment
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validateRequest
  ],
  equipmentController.getEquipment.bind(equipmentController)
);

// Get equipment by ID
router.get(
  '/:id',
  equipmentController.getEquipmentById.bind(equipmentController)
);

// Get equipment history
router.get(
  '/:id/history',
  equipmentController.getEquipmentHistory.bind(equipmentController)
);

// Create equipment (IT_ADMIN only)
router.post(
  '/',
  authorize('IT_ADMIN', 'SYSTEM_ADMIN'),
  [
    body('assetTag').notEmpty().withMessage('Asset tag is required'),
    body('categoryId').isUUID().withMessage('Valid category ID is required'),
    body('modelName').notEmpty().withMessage('Model name is required'),
    validateRequest
  ],
  equipmentController.createEquipment.bind(equipmentController)
);

// Bulk upload equipment (IT_ADMIN only)
router.post(
  '/bulk',
  authorize('IT_ADMIN', 'SYSTEM_ADMIN'),
  [
    body('equipment').isArray({ min: 1 }).withMessage('Equipment array is required'),
    validateRequest
  ],
  equipmentController.bulkUpload.bind(equipmentController)
);

// Update equipment (IT_ADMIN only)
router.patch(
  '/:id',
  authorize('IT_ADMIN', 'SYSTEM_ADMIN'),
  equipmentController.updateEquipment.bind(equipmentController)
);

// Delete/retire equipment (IT_ADMIN only)
router.delete(
  '/:id',
  authorize('IT_ADMIN', 'SYSTEM_ADMIN'),
  equipmentController.deleteEquipment.bind(equipmentController)
);

export default router;
