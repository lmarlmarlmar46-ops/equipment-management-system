import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User.model';
import { Equipment } from './Equipment.model';
import { EquipmentRequest } from './EquipmentRequest.model';

@Table({
  tableName: 'equipment_assignments',
  timestamps: true
})
export class EquipmentAssignment extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  assignmentId!: string;

  @ForeignKey(() => Equipment)
  @AllowNull(false)
  @Column(DataType.UUID)
  equipmentId!: string;

  @BelongsTo(() => Equipment)
  equipment?: Equipment;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, 'userId')
  user?: User;

  @ForeignKey(() => EquipmentRequest)
  @Column(DataType.UUID)
  requestId?: string;

  @BelongsTo(() => EquipmentRequest)
  request?: EquipmentRequest;

  @Default('PERMANENT')
  @Column(DataType.STRING(50))
  assignmentType!: string; // PERMANENT, TEMPORARY, LOANER

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  assignedBy!: string;

  @BelongsTo(() => User, 'assignedBy')
  assignedByUser?: User;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  assignmentDate!: Date;

  @Column(DataType.DATEONLY)
  expectedReturnDate?: Date;

  @Column(DataType.DATEONLY)
  actualReturnDate?: Date;

  @Column(DataType.STRING(50))
  deliveryMethod?: string; // SHIP, PICKUP, HAND_DELIVERY

  @Column(DataType.STRING(100))
  trackingNumber?: string;

  @Column(DataType.STRING(100))
  courierService?: string;

  @Column(DataType.STRING(20))
  assignmentCondition?: string;

  @Column(DataType.JSONB)
  assignmentChecklist?: Record<string, any>;

  @Column(DataType.JSONB)
  assignmentPhotos?: string[];

  @Default('PENDING')
  @Column(DataType.STRING(50))
  acceptanceStatus!: string; // PENDING, ACCEPTED, REJECTED, IN_TRANSIT

  @Column(DataType.DATE)
  acceptanceDate?: Date;

  @Column(DataType.TEXT)
  acceptanceSignature?: string;

  @Column(DataType.TEXT)
  acceptanceNotes?: string;

  @Column(DataType.JSONB)
  acceptancePhotos?: string[];

  @Default(false)
  @Column(DataType.BOOLEAN)
  returnInitiated!: boolean;

  @Column(DataType.DATEONLY)
  returnScheduledDate?: Date;

  @Column(DataType.STRING(50))
  returnMethod?: string;

  @Column(DataType.STRING(20))
  returnCondition?: string;

  @Column(DataType.JSONB)
  returnChecklist?: Record<string, any>;

  @Column(DataType.JSONB)
  returnPhotos?: string[];

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  returnProcessedBy?: string;

  @BelongsTo(() => User, 'returnProcessedBy')
  returnProcessor?: User;

  @Default(false)
  @Column(DataType.BOOLEAN)
  damageAtReturn!: boolean;

  @Column(DataType.TEXT)
  damageDescription?: string;

  @Column(DataType.DECIMAL(10, 2))
  damageCost?: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  damageCharged!: boolean;

  @Column(DataType.TEXT)
  notes?: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  // Virtual field
  get daysAssigned(): number {
    const endDate = this.actualReturnDate ? new Date(this.actualReturnDate) : new Date();
    const startDate = new Date(this.assignmentDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export default EquipmentAssignment;
