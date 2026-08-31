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
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User.model';

@Table({
  tableName: 'equipment_requests',
  timestamps: true
})
export class EquipmentRequest extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  requestId!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  requestNumber!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  requestedBy!: string;

  @BelongsTo(() => User, 'requestedBy')
  requester?: User;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  requestType!: string; // NEW, REPLACEMENT, UPGRADE, TEMPORARY, BULK

  @Default('STANDARD')
  @Column(DataType.STRING(20))
  priority!: string; // URGENT, HIGH, STANDARD, LOW

  @Default('PENDING')
  @AllowNull(false)
  @Column(DataType.STRING(50))
  status!: string; // DRAFT, PENDING, UNDER_REVIEW, APPROVED, REJECTED, PARTIALLY_APPROVED, ALLOCATED, CANCELLED, MORE_INFO_REQUIRED

  @AllowNull(false)
  @Column(DataType.TEXT)
  businessJustification!: string;

  @Column(DataType.DATEONLY)
  preferredDeliveryDate?: Date;

  @Column(DataType.DECIMAL(10, 2))
  estimatedTotalCost?: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isTemplateUsed!: boolean;

  @Column(DataType.STRING(100))
  templateName?: string;

  @Column(DataType.UUID)
  bulkRequestId?: string;

  @ForeignKey(() => EquipmentRequest)
  @Column(DataType.UUID)
  parentRequestId?: string;

  @BelongsTo(() => EquipmentRequest, 'parentRequestId')
  parentRequest?: EquipmentRequest;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  currentApproverId?: string;

  @BelongsTo(() => User, 'currentApproverId')
  currentApprover?: User;

  @Column(DataType.DATE)
  finalApprovalDate?: Date;

  @Column(DataType.TEXT)
  rejectionReason?: string;

  @Column(DataType.TEXT)
  cancellationReason?: string;

  @Column(DataType.TEXT)
  notes?: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  createdBy?: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  updatedBy?: string;

  // Virtual field
  get ageDays(): number {
    const now = new Date();
    const created = new Date(this.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export default EquipmentRequest;
