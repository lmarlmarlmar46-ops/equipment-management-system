import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Mock dashboard data
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalAssets: { count: 200, value: 500000.00 },
      equipmentByStatus: {
        AVAILABLE: 50,
        ASSIGNED: 130,
        UNDER_MAINTENANCE: 15,
        DAMAGED: 5
      },
      pendingRequests: 12,
      pendingApprovals: 5,
      openMaintenanceTickets: 8,
      lowStockItems: 3,
      allocationRate: 75.5,
      averageAllocationTimeDays: 3.2,
      maintenanceCostMtd: 5200.00
    }
  });
});

router.get('/trends', (req, res) => {
  const { metric = 'allocations', period = '30days' } = req.query;
  
  res.json({
    success: true,
    data: {
      metric,
      period,
      data: []
    }
  });
});

export default router;
