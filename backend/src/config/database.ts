import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || '';

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  models: [__dirname + '/../models'],
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

export default sequelize;
