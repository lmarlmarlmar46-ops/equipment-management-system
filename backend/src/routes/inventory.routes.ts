import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Placeholder routes
router.get('/summary', (req, res) => res.json({ success: true, data: { categories: [], totals: {} } }));
router.get('/low-stock', authorize('IT_ADMIN', 'SYSTEM_ADMIN'), (req, res) => res.json({ success: true, data: { items: [] } }));
router.post('/transactions', authorize('IT_ADMIN', 'SYSTEM_ADMIN'), (req, res) => res.status(201).json({ success: true, message: 'Transaction recorded' }));

export default router;
