import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { EquipmentRequest } from '../models/EquipmentRequest.model';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export class RequestController {
  // Generate request number
  private generateRequestNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `REQ-${year}-${random}`;
  }

  // Get all requests
  async getRequests(req: AuthRequest, res: Response) {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      requestedBy,
      dateFrom,
      dateTo
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = {};

    // Apply filters based on user role
    if (req.user?.role === 'EMPLOYEE') {
      // Employees can only see their own requests
      whereClause.requestedBy = req.user.userId;
    } else if (requestedBy) {
      whereClause.requestedBy = requestedBy;
    }

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt[Op.gte] = new Date(dateFrom as string);
      if (dateTo) whereClause.createdAt[Op.lte] = new Date(dateTo as string);
    }

    const { count, rows } = await EquipmentRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['userId', 'firstName', 'lastName', 'email', 'employeeId', 'department']
        },
        {
          model: User,
          as: 'currentApprover',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        }
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        items: rows,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / Number(limit)),
          totalItems: count,
          itemsPerPage: Number(limit)
        }
      }
    });
  }

  // Get request by ID
  async getRequestById(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const request = await EquipmentRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['userId', 'firstName', 'lastName', 'email', 'employeeId', 'department']
        },
        {
          model: User,
          as: 'currentApprover',
          attributes: ['userId', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!request) {
      throw new AppError('Request not found', 404, 'REQUEST_NOT_FOUND');
    }

    // Check permissions
    if (
      req.user?.role === 'EMPLOYEE' &&
      request.requestedBy !== req.user.userId
    ) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    // TODO: Include request items and approval workflow

    res.json({
      success: true,
      data: request
    });
  }

  // Create new request
  async createRequest(req: AuthRequest, res: Response) {
    const {
      requestType,
      priority = 'STANDARD',
      businessJustification,
      preferredDeliveryDate,
      items,
      saveAsDraft = false
    } = req.body;

    if (!items || items.length === 0) {
      throw new AppError('At least one item is required', 400, 'NO_ITEMS');
    }

    const requestNumber = this.generateRequestNumber();
    const status = saveAsDraft ? 'DRAFT' : 'PENDING';

    // Calculate estimated total cost
    let estimatedTotalCost = 0;
    items.forEach((item: any) => {
      estimatedTotalCost += (item.unitPriceEstimate || 0) * (item.quantity || 1);
    });

    const request = await EquipmentRequest.create({
      requestId: uuidv4(),
      requestNumber,
      requestedBy: req.user!.userId,
      requestType,
      priority,
      status,
      businessJustification,
      preferredDeliveryDate,
      estimatedTotalCost,
      createdBy: req.user!.userId
    });

    // TODO: Create request items
    // TODO: Trigger approval workflow if not draft

    logger.info(`Request created: ${requestNumber} by ${req.user?.email}`);

    res.status(201).json({
      success: true,
      message: saveAsDraft ? 'Request saved as draft' : 'Request submitted successfully',
      data: {
        requestId: request.requestId,
        requestNumber: request.requestNumber,
        status: request.status,
        approvalRequired: !saveAsDraft,
        estimatedApprovalTimeDays: 3
      }
    });
  }

  // Update request (drafts only)
  async updateRequest(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const updates = req.body;

    const request = await EquipmentRequest.findByPk(id);

    if (!request) {
      throw new AppError('Request not found', 404, 'REQUEST_NOT_FOUND');
    }

    // Check permissions
    if (request.requestedBy !== req.user?.userId) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    // Only drafts can be updated
    if (request.status !== 'DRAFT') {
      throw new AppError('Only draft requests can be updated', 400, 'NOT_DRAFT');
    }

    Object.assign(request, updates, {
      updatedBy: req.user?.userId
    });

    await request.save();

    logger.info(`Request updated: ${request.requestNumber} by ${req.user?.email}`);

    res.json({
      success: true,
      message: 'Request updated successfully',
      data: request
    });
  }

  // Submit draft request
  async submitRequest(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const request = await EquipmentRequest.findByPk(id);

    if (!request) {
      throw new AppError('Request not found', 404, 'REQUEST_NOT_FOUND');
    }

    // Check permissions
    if (request.requestedBy !== req.user?.userId) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    // Only drafts can be submitted
    if (request.status !== 'DRAFT') {
      throw new AppError('Request has already been submitted', 400, 'NOT_DRAFT');
    }

    request.status = 'PENDING';
    request.updatedBy = req.user?.userId;
    await request.save();

    // TODO: Trigger approval workflow

    logger.info(`Request submitted: ${request.requestNumber} by ${req.user?.email}`);

    res.json({
      success: true,
      message: 'Request submitted successfully',
      data: request
    });
  }

  // Cancel request
  async cancelRequest(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const request = await EquipmentRequest.findByPk(id);

    if (!request) {
      throw new AppError('Request not found', 404, 'REQUEST_NOT_FOUND');
    }

    // Check permissions
    if (
      request.requestedBy !== req.user?.userId &&
      req.user?.role !== 'IT_ADMIN'
    ) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    // Can't cancel approved or allocated requests
    if (['APPROVED', 'ALLOCATED'].includes(request.status)) {
      throw new AppError('Cannot cancel request in current status', 400, 'INVALID_STATUS');
    }

    request.status = 'CANCELLED';
    request.cancellationReason = cancellationReason;
    request.updatedBy = req.user?.userId;
    await request.save();

    logger.info(`Request cancelled: ${request.requestNumber} by ${req.user?.email}`);

    res.json({
      success: true,
      message: 'Request cancelled successfully'
    });
  }

  // Bulk create requests
  async bulkCreateRequests(req: AuthRequest, res: Response) {
    const { requests } = req.body;

    if (!Array.isArray(requests) || requests.length === 0) {
      throw new AppError('Invalid requests array', 400, 'INVALID_DATA');
    }

    const bulkRequestId = uuidv4();
    const created: any[] = [];
    const errors: any[] = [];

    for (const item of requests) {
      try {
        // Validate employee exists
        const employee = await User.findOne({
          where: { employeeId: item.employeeId }
        });

        if (!employee) {
          errors.push({
            employeeId: item.employeeId,
            error: 'Employee not found'
          });
          continue;
        }

        const requestNumber = this.generateRequestNumber();

        const request = await EquipmentRequest.create({
          requestId: uuidv4(),
          requestNumber,
          requestedBy: employee.userId,
          requestType: 'NEW',
          priority: 'STANDARD',
          status: 'PENDING',
          businessJustification: item.justification,
          bulkRequestId,
          createdBy: req.user!.userId
        });

        created.push({
          requestId: request.requestId,
          requestNumber: request.requestNumber,
          employeeId: item.employeeId
        });
      } catch (error: any) {
        errors.push({
          employeeId: item.employeeId,
          error: error.message
        });
      }
    }

    logger.info(`Bulk requests created: ${created.length} by ${req.user?.email}`);

    res.status(201).json({
      success: true,
      message: 'Bulk requests created',
      data: {
        bulkRequestId,
        totalRequests: requests.length,
        requests: created,
        errors
      }
    });
  }
}

export default new RequestController();
