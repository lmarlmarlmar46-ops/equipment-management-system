import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User.model';

@Table({
  tableName: 'equipment',
  timestamps: true
})
export class Equipment extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  equipmentId!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  assetTag!: string;

  @Unique
  @Column(DataType.STRING(100))
  serialNumber?: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  categoryId!: string;

  @Column(DataType.STRING(100))
  manufacturer?: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  modelName!: string;

  @Column(DataType.STRING(100))
  modelNumber?: string;

  @Column(DataType.JSONB)
  specifications?: Record<string, any>;

  @Column(DataType.DATEONLY)
  purchaseDate?: Date;

  @Column(DataType.DECIMAL(10, 2))
  purchasePrice?: number;

  @Column(DataType.DECIMAL(10, 2))
  currentValue?: number;

  @Column(DataType.UUID)
  vendorId?: string;

  @Column(DataType.DATEONLY)
  warrantyStartDate?: Date;

  @Column(DataType.DATEONLY)
  warrantyEndDate?: Date;

  @Column(DataType.STRING(50))
  warrantyType?: string; // MANUFACTURER, EXTENDED, NONE

  @Column(DataType.UUID)
  locationId?: string;

  @Default('AVAILABLE')
  @AllowNull(false)
  @Column(DataType.STRING(50))
  status!: string; // AVAILABLE, ASSIGNED, UNDER_MAINTENANCE, DAMAGED, LOST, RETIRED, RESERVED, IN_TRANSIT

  @Column(DataType.STRING(20))
  conditionRating?: string; // EXCELLENT, GOOD, FAIR, POOR

  @Column(DataType.INTEGER)
  healthScore?: number; // 0-100

  @Column(DataType.DATEONLY)
  lastMaintenanceDate?: Date;

  @Column(DataType.DATEONLY)
  nextMaintenanceDue?: Date;

  @Column(DataType.STRING(255))
  qrCode?: string;

  @Column(DataType.STRING(255))
  imageUrl?: string;

  @Column(DataType.TEXT)
  notes?: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @Column(DataType.DATEONLY)
  retiredDate?: Date;

  @Column(DataType.TEXT)
  retirementReason?: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  createdBy?: string;

  @BelongsTo(() => User, 'createdBy')
  creator?: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  updatedBy?: string;

  @BelongsTo(() => User, 'updatedBy')
  updater?: User;

  // Virtual field
  get isUnderWarranty(): boolean {
    if (!this.warrantyEndDate) return false;
    return new Date(this.warrantyEndDate) >= new Date();
  }

  get isMaintenanceOverdue(): boolean {
    if (!this.nextMaintenanceDue) return false;
    return new Date(this.nextMaintenanceDue) < new Date();
  }
}

export default Equipment;
