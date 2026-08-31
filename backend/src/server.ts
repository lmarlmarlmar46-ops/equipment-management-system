import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import 'express-async-errors';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { sequelize } from './config/database';
import { redisClient } from './config/redis';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import equipmentRoutes from './routes/equipment.routes';
import requestRoutes from './routes/request.routes';
import approvalRoutes from './routes/approval.routes';
import assignmentRoutes from './routes/assignment.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import inventoryRoutes from './routes/inventory.routes';
import notificationRoutes from './routes/notification.routes';
import reportRoutes from './routes/report.routes';
import dashboardRoutes from './routes/dashboard.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting
app.use('/api', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'EquipTrack API'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/approvals', approvalRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('✅ Database connected successfully');

    // Sync models (in development only)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('✅ Database models synchronized');
    }

    // Test Redis connection (optional)
    try {
      await redisClient.ping();
      logger.info('✅ Redis connected successfully');
    } catch (redisError) {
      logger.warn('⚠️  Redis connection failed - sessions will use memory store');
      logger.warn('   Install Redis for production use');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  await redisClient.quit();
  process.exit(0);
});

startServer();

export default app;
