import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { Equipment } from '../models/Equipment.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export class EquipmentController {
  // Get all equipment with filters
  async getEquipment(req: Request, res: Response) {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      location,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = { isActive: true };

    // Apply filters
    if (category) whereClause.categoryId = category;
    if (status) whereClause.status = status;
    if (location) whereClause.locationId = location;
    
    if (search) {
      whereClause[Op.or] = [
        { assetTag: { [Op.iLike]: `%${search}%` } },
        { serialNumber: { [Op.iLike]: `%${search}%` } },
        { modelName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Equipment.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [[sortBy as string, sortOrder as string]]
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

  // Get equipment by ID
  async getEquipmentById(req: Request, res: Response) {
    const { id } = req.params;

    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      throw new AppError('Equipment not found', 404, 'EQUIPMENT_NOT_FOUND');
    }

    res.json({
      success: true,
      data: equipment
    });
  }

  // Create new equipment
  async createEquipment(req: AuthRequest, res: Response) {
    const {
      assetTag,
      serialNumber,
      categoryId,
      manufacturer,
      modelName,
      modelNumber,
      specifications,
      purchaseDate,
      purchasePrice,
      vendorId,
      warrantyStartDate,
      warrantyEndDate,
      warrantyType,
      locationId,
      conditionRating,
      notes
    } = req.body;

    // Check if asset tag already exists
    const existing = await Equipment.findOne({ where: { assetTag } });
    if (existing) {
      throw new AppError('Asset tag already exists', 409, 'DUPLICATE_ASSET_TAG');
    }

    const equipmentId = uuidv4();

    // Generate QR code
    const qrCodeData = JSON.stringify({
      equipmentId,
      assetTag,
      modelName
    });
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

    // Calculate current value (simple depreciation)
    const currentValue = purchasePrice || 0;

    const equipment = await Equipment.create({
      equipmentId,
      assetTag,
      serialNumber,
      categoryId,
      manufacturer,
      modelName,
      modelNumber,
      specifications,
      purchaseDate,
      purchasePrice,
      currentValue,
      vendorId,
      warrantyStartDate,
      warrantyEndDate,
      warrantyType,
      locationId,
      status: 'AVAILABLE',
      conditionRating,
      healthScore: 100,
      qrCode: qrCodeUrl,
      notes,
      createdBy: req.user?.userId
    });

    logger.info(`Equipment created: ${assetTag} by ${req.user?.email}`);

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: {
        equipmentId: equipment.equipmentId,
        assetTag: equipment.assetTag,
        qrCode: equipment.qrCode
      }
    });
  }

  // Update equipment
  async updateEquipment(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const updates = req.body;

    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      throw new AppError('Equipment not found', 404, 'EQUIPMENT_NOT_FOUND');
    }

    // Update fields
    Object.assign(equipment, updates, {
      updatedBy: req.user?.userId
    });

    await equipment.save();

    logger.info(`Equipment updated: ${equipment.assetTag} by ${req.user?.email}`);

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });
  }

  // Delete/retire equipment
  async deleteEquipment(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { retirementReason } = req.body;

    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      throw new AppError('Equipment not found', 404, 'EQUIPMENT_NOT_FOUND');
    }

    // Check if equipment is currently assigned
    if (equipment.status === 'ASSIGNED') {
      throw new AppError('Cannot retire equipment that is currently assigned', 400, 'EQUIPMENT_ASSIGNED');
    }

    // Soft delete
    equipment.isActive = false;
    equipment.status = 'RETIRED';
    equipment.retiredDate = new Date();
    equipment.retirementReason = retirementReason;
    equipment.updatedBy = req.user?.userId;

    await equipment.save();

    logger.info(`Equipment retired: ${equipment.assetTag} by ${req.user?.email}`);

    res.json({
      success: true,
      message: 'Equipment retired successfully'
    });
  }

  // Get equipment history
  async getEquipmentHistory(req: Request, res: Response) {
    const { id } = req.params;

    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      throw new AppError('Equipment not found', 404, 'EQUIPMENT_NOT_FOUND');
    }

    // TODO: Get history from EquipmentHistory model
    const history: any[] = [];

    res.json({
      success: true,
      data: {
        items: history
      }
    });
  }

  // Bulk upload equipment
  async bulkUpload(req: AuthRequest, res: Response) {
    const { equipment: equipmentList } = req.body;

    if (!Array.isArray(equipmentList) || equipmentList.length === 0) {
      throw new AppError('Invalid equipment list', 400, 'INVALID_DATA');
    }

    const created: any[] = [];
    const errors: any[] = [];

    for (const item of equipmentList) {
      try {
        // Check for duplicates
        const existing = await Equipment.findOne({
          where: { assetTag: item.assetTag }
        });

        if (existing) {
          errors.push({
            assetTag: item.assetTag,
            error: 'Duplicate asset tag'
          });
          continue;
        }

        const equipmentId = uuidv4();
        const qrCodeData = JSON.stringify({
          equipmentId,
          assetTag: item.assetTag,
          modelName: item.modelName
        });
        const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

        const equipment = await Equipment.create({
          equipmentId,
          ...item,
          currentValue: item.purchasePrice || 0,
          status: 'AVAILABLE',
          healthScore: 100,
          qrCode: qrCodeUrl,
          createdBy: req.user?.userId
        });

        created.push({
          equipmentId: equipment.equipmentId,
          assetTag: equipment.assetTag
        });
      } catch (error: any) {
        errors.push({
          assetTag: item.assetTag,
          error: error.message
        });
      }
    }

    logger.info(`Bulk upload: ${created.length} created, ${errors.length} errors by ${req.user?.email}`);

    res.status(201).json({
      success: true,
      message: `${created.length} equipment items created`,
      data: {
        created,
        errors
      }
    });
  }
}

export default new EquipmentController();
