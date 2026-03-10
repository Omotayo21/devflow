import pg from 'pg';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;


const pool = new Pool(
  config.db.connectionString
    ? {
        connectionString: config.db.connectionString,
        ssl: { rejectUnauthorized: false }, // required for Railway PostgreSQL
      }
    : {
        host: config.db.host,
        port: config.db.port,
        database: config.db.name,
        user: config.db.user,
        password: config.db.password,
      }
);
pool.on('connect', () => logger.info('Connected to PostgreSQL'));
pool.on('error', (err) => logger.error({ err }, 'PostgreSQL error'));

export const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};