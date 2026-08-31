import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN
  });

  return { accessToken, refreshToken };
};

export class AuthController {
  // Register new user
  async register(req: Request, res: Response) {
    const {
      email,
      employeeId,
      firstName,
      lastName,
      phoneNumber,
      department,
      password
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('User already exists', 409, 'USER_EXISTS');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      userId: uuidv4(),
      email,
      employeeId,
      firstName,
      lastName,
      phoneNumber,
      department,
      passwordHash,
      role: 'EMPLOYEE', // Default role
      employmentStatus: 'ACTIVE'
    });

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        userId: user.userId,
        email: user.email,
        verificationSent: true
      }
    });
  }

  // Login
  async login(req: Request, res: Response) {
    const { email, password, rememberDevice } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if account is locked
    if (user.accountLocked) {
      throw new AppError('Account is locked. Please contact support.', 403, 'ACCOUNT_LOCKED');
    }

    // Check employment status
    if (user.employmentStatus !== 'ACTIVE') {
      throw new AppError('Account is not active', 403, 'ACCOUNT_INACTIVE');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.accountLocked = true;
        await user.save();
        throw new AppError('Account locked due to multiple failed login attempts', 403, 'ACCOUNT_LOCKED');
      }

      await user.save();
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      const sessionId = uuidv4();
      
      // Store temporary session for MFA verification
      await redisClient.setex(
        `mfa_session:${sessionId}`,
        300, // 5 minutes
        JSON.stringify({
          userId: user.userId,
          email: user.email,
          role: user.role,
          rememberDevice
        })
      );

      // TODO: Send OTP via email/SMS
      logger.info(`MFA required for user: ${user.email}`);

      return res.json({
        success: true,
        data: {
          mfaRequired: true,
          sessionId,
          otpSentTo: user.email
        }
      });
    }

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    // Store refresh token in Redis
    await redisClient.setex(
      `refresh_token:${user.userId}`,
      7 * 24 * 60 * 60, // 7 days
      refreshToken
    );

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department
        },
        mfaRequired: false
      }
    });
  }

  // Verify MFA
  async verifyMfa(req: Request, res: Response) {
    const { sessionId, otpCode } = req.body;

    // Get temporary session
    const sessionData = await redisClient.get(`mfa_session:${sessionId}`);

    if (!sessionData) {
      throw new AppError('Invalid or expired session', 401, 'INVALID_SESSION');
    }

    const { userId, email, role, rememberDevice } = JSON.parse(sessionData);

    // Get user
    const user = await User.findByPk(userId);

    if (!user || !user.mfaSecret) {
      throw new AppError('MFA not configured', 400, 'MFA_NOT_CONFIGURED');
    }

    // Verify OTP
    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: otpCode,
      window: 2
    });

    if (!isValid) {
      throw new AppError('Invalid OTP code', 401, 'INVALID_OTP');
    }

    // Delete temporary session
    await redisClient.del(`mfa_session:${sessionId}`);

    // Generate tokens
    const payload: TokenPayload = { userId, email, role };
    const { accessToken, refreshToken } = generateTokens(payload);

    // Store refresh token
    await redisClient.setex(
      `refresh_token:${userId}`,
      7 * 24 * 60 * 60,
      refreshToken
    );

    logger.info(`MFA verified for user: ${email}`);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  }

  // Refresh token
  async refreshToken(req: Request, res: Response) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No refresh token provided', 401, 'NO_TOKEN');
    }

    const refreshToken = authHeader.split(' ')[1];

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as TokenPayload;

      // Check if token is stored in Redis
      const storedToken = await redisClient.get(`refresh_token:${decoded.userId}`);

      if (storedToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
      }

      // Generate new access token
      const payload: TokenPayload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };

      const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });

      res.json({
        success: true,
        data: {
          accessToken,
          expiresIn: 3600
        }
      });
    } catch (error) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }
  }

  // Logout
  async logout(req: Request, res: Response) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token) as any;

      if (decoded && decoded.userId) {
        // Delete refresh token
        await redisClient.del(`refresh_token:${decoded.userId}`);

        // Blacklist access token
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await redisClient.setex(`blacklist:${token}`, expiresIn, 'true');
        }
      }
    }

    logger.info('User logged out');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  // Forgot password
  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    }

    // Generate reset token
    const resetToken = uuidv4();

    // Store reset token in Redis (valid for 1 hour)
    await redisClient.setex(
      `password_reset:${resetToken}`,
      3600,
      user.userId
    );

    // TODO: Send reset email
    logger.info(`Password reset requested for: ${email}`);

    res.json({
      success: true,
      message: 'Password reset instructions sent to your email',
      data: {
        resetToken // Remove this in production, only for development
      }
    });
  }

  // Reset password
  async resetPassword(req: Request, res: Response) {
    const { resetToken, newPassword } = req.body;

    // Get user ID from Redis
    const userId = await redisClient.get(`password_reset:${resetToken}`);

    if (!userId) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
    }

    // Get user
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    user.passwordHash = passwordHash;
    user.failedLoginAttempts = 0;
    user.accountLocked = false;
    await user.save();

    // Delete reset token
    await redisClient.del(`password_reset:${resetToken}`);

    logger.info(`Password reset for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  }

  // Change password
  async changePassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.userId;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    user.passwordHash = passwordHash;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  }
}

export default new AuthController();
