import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Placeholder routes
router.get('/', (req, res) => res.json({ success: true, data: { items: [], unreadCount: 0 } }));
router.patch('/:id/read', (req, res) => res.json({ success: true, message: 'Marked as read' }));
router.post('/mark-all-read', (req, res) => res.json({ success: true, message: 'All marked as read' }));
router.get('/preferences', (req, res) => res.json({ success: true, data: { preferences: [], quietHours: {} } }));
router.put('/preferences', (req, res) => res.json({ success: true, message: 'Preferences updated' }));

export default router;
