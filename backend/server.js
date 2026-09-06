const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const employeesRouter = require('./routes/employees');
const equipmentRouter = require('./routes/equipment');
const allocationsRouter = require('./routes/allocations');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Railway health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EquipTrack API is running',
    endpoints: {
      health: '/api/health',
      dashboard: '/api/dashboard/stats',
      employees: '/api/employees',
      equipment: '/api/equipment',
      allocations: '/api/allocations'
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
app.use('/api/employees', employeesRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/allocations', allocationsRouter);
app.use('/api/dashboard', dashboardRouter);

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
