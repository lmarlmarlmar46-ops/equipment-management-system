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
import { Equipment } from './Equipment.model';

@Table({
  tableName: 'maintenance_tickets',
  timestamps: true
})
export class MaintenanceTicket extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  ticketId!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  ticketNumber!: string;

  @ForeignKey(() => Equipment)
  @AllowNull(false)
  @Column(DataType.UUID)
  equipmentId!: string;

  @BelongsTo(() => Equipment)
  equipment?: Equipment;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  reportedBy?: string;

  @BelongsTo(() => User, 'reportedBy')
  reporter?: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  assignedTo?: string;

  @BelongsTo(() => User, 'assignedTo')
  assignee?: User;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  ticketType!: string; // REACTIVE, PREVENTIVE, INSPECTION

  @Default('MEDIUM')
  @Column(DataType.STRING(20))
  priority!: string; // CRITICAL, HIGH, MEDIUM, LOW

  @Default('OPEN')
  @AllowNull(false)
  @Column(DataType.STRING(50))
  status!: string; // OPEN, IN_PROGRESS, WAITING_PARTS, WITH_VENDOR, RESOLVED, CLOSED, CANCELLED

  @Column(DataType.STRING(50))
  category?: string; // HARDWARE, SOFTWARE, PERFORMANCE, PHYSICAL_DAMAGE

  @AllowNull(false)
  @Column(DataType.TEXT)
  issueDescription!: string;

  @Column(DataType.TEXT)
  stepsToReproduce?: string;

  @Column(DataType.TEXT)
  troubleshootingAttempted?: string;

  @Column(DataType.JSONB)
  issuePhotos?: string[];

  @Column(DataType.TEXT)
  diagnosis?: string;

  @Column(DataType.TEXT)
  resolution?: string;

  @Column(DataType.JSONB)
  resolutionPhotos?: string[];

  @Default(false)
  @Column(DataType.BOOLEAN)
  requiresVendor!: boolean;

  @Column(DataType.UUID)
  vendorId?: string;

  @Column(DataType.STRING(100))
  vendorTicketNumber?: string;

  @Column(DataType.DECIMAL(10, 2))
  vendorEstimate?: number;

  @Column(DataType.DECIMAL(10, 2))
  actualCost?: number;

  @Column(DataType.DECIMAL(10, 2))
  partsCost?: number;

  @Column(DataType.DECIMAL(10, 2))
  laborCost?: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  loanerProvided!: boolean;

  @ForeignKey(() => Equipment)
  @Column(DataType.UUID)
  loanerEquipmentId?: string;

  @BelongsTo(() => Equipment, 'loanerEquipmentId')
  loanerEquipment?: Equipment;

  @Column(DataType.DATE)
  slaDueDate?: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  slaBreached!: boolean;

  @Column(DataType.DECIMAL(10, 2))
  timeToResolveHours?: number;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  openedAt!: Date;

  @Column(DataType.DATE)
  startedAt?: Date;

  @Column(DataType.DATE)
  resolvedAt?: Date;

  @Column(DataType.DATE)
  closedAt?: Date;

  @Column(DataType.TEXT)
  notes?: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  // Virtual field
  get ageHours(): number {
    const endDate = this.closedAt ? new Date(this.closedAt) : new Date();
    const startDate = new Date(this.openedAt);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.round(diffTime / (1000 * 60 * 60));
  }
}

export default MaintenanceTicket;
