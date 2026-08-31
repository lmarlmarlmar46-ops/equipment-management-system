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

@Table({
  tableName: 'users',
  timestamps: true
})
export class User extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  userId!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  employeeId!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(255))
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  firstName!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  lastName!: string;

  @Column(DataType.STRING(20))
  phoneNumber?: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  role!: string; // EMPLOYEE, IT_ADMIN, MANAGER, MAINTENANCE, AUDITOR, SYSTEM_ADMIN

  @Column(DataType.STRING(100))
  department?: string;

  @Column(DataType.STRING(100))
  jobTitle?: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  managerId?: string;

  @BelongsTo(() => User, 'managerId')
  manager?: User;

  @HasMany(() => User, 'managerId')
  subordinates?: User[];

  @Column(DataType.UUID)
  locationId?: string;

  @Default('ACTIVE')
  @Column(DataType.STRING(20))
  employmentStatus!: string; // ACTIVE, ON_LEAVE, TERMINATED

  @Column(DataType.DATEONLY)
  dateJoined?: Date;

  @Column(DataType.DATEONLY)
  lastWorkingDay?: Date;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  passwordHash!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  mfaEnabled!: boolean;

  @Column(DataType.STRING(255))
  mfaSecret?: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  accountLocked!: boolean;

  @Default(0)
  @Column(DataType.INTEGER)
  failedLoginAttempts!: number;

  @Column(DataType.DATE)
  lastLoginAt?: Date;

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

  // Virtual field for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Method to safely return user data (without sensitive info)
  toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;
    delete values.mfaSecret;
    return values;
  }
}

export default User;
