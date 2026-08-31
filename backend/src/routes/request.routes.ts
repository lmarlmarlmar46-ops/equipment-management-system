import { Router } from 'express';
import requestController from '../controllers/request.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { body, query } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all requests
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validateRequest
  ],
  requestController.getRequests.bind(requestController)
);

// Get request by ID
router.get(
  '/:id',
  requestController.getRequestById.bind(requestController)
);

// Create request
router.post(
  '/',
  [
    body('requestType').isIn(['NEW', 'REPLACEMENT', 'UPGRADE', 'TEMPORARY']).withMessage('Valid request type is required'),
    body('businessJustification').notEmpty().withMessage('Business justification is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    validateRequest
  ],
  requestController.createRequest.bind(requestController)
);

// Bulk create requests (Manager/Admin only)
router.post(
  '/bulk',
  authorize('MANAGER', 'IT_ADMIN', 'SYSTEM_ADMIN'),
  [
    body('requests').isArray({ min: 1 }).withMessage('Requests array is required'),
    validateRequest
  ],
  requestController.bulkCreateRequests.bind(requestController)
);

// Update request (draft only)
router.patch(
  '/:id',
  requestController.updateRequest.bind(requestController)
);

// Submit draft request
router.post(
  '/:id/submit',
  requestController.submitRequest.bind(requestController)
);

// Cancel request
router.post(
  '/:id/cancel',
  [
    body('cancellationReason').notEmpty().withMessage('Cancellation reason is required'),
    validateRequest
  ],
  requestController.cancelRequest.bind(requestController)
);

export default router;
