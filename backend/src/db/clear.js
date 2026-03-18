import { db } from './index.js';
import { logger } from '../utils/logger.js';

async function clearDb() {
  try {
    await db.query(`
      TRUNCATE users, workspaces, workspace_members, projects, tasks, comments, activities, notifications RESTART IDENTITY CASCADE;
    `);
    logger.info('Database cleared successfully');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Clear DB failed');
    process.exit(1);
  }
}

clearDb();
