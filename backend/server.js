const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const authRouter = require('./routes/auth');
const employeesRouter = require('./routes/employees');
const equipmentRouter = require('./routes/equipment');
const allocationsRouter = require('./routes/allocations');
const dashboardRouter = require('./routes/dashboard');
const maintenanceRouter = require('./routes/maintenance');
const warrantiesRouter = require('./routes/warranties');
const reservationsRouter = require('./routes/reservations');
const serviceRequestsRouter = require('./routes/service-requests');
const reportsRouter = require('./routes/reports');
const notificationsRouter = require('./routes/notifications');
const depreciationRouter = require('./routes/depreciation');
const bulkRouter = require('./routes/bulk');
const workflowRouter = require('./routes/workflow');
const seedRouter = require('./routes/seed');
const testAuthRouter = require('./routes/test-auth');

// Initialize database
const db = require('./database-pg');
db.initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Railway health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EquipTrack API is running',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth (login, register, me)',
      dashboard: '/api/dashboard/stats',
      employees: '/api/employees',
      equipment: '/api/equipment',
      allocations: '/api/allocations',
      maintenance: '/api/maintenance',
      warranties: '/api/warranties',
      reservations: '/api/reservations',
      serviceRequests: '/api/service-requests',
      reports: '/api/reports',
      notifications: '/api/notifications',
      depreciation: '/api/depreciation',
      bulk: '/api/bulk (import/export)',
      workflow: '/api/workflow (IT operations workflow)',
      seed: '/api/seed (database seeding)'
    }
  });
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/allocations', allocationsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/warranties', warrantiesRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/service-requests', serviceRequestsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/depreciation', depreciationRouter);
app.use('/api/bulk', bulkRouter);
app.use('/api/workflow', workflowRouter);
app.use('/api/seed', seedRouter);
app.use('/api/test', testAuthRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EquipTrack API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`EquipTrack Backend Server`);
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`=================================`);
});

module.exports = app;
