import { db } from '../db/index.js';
import { logger } from './logger.js';

export async function logActivity({
  action,
  entityType,
  entityId,
  userId,
  workspaceId,
  metadata = {},
}) {
  try {
    await db.query(
      `INSERT INTO activities 
        (action, entity_type, entity_id, user_id, workspace_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [action, entityType, entityId, userId, workspaceId, JSON.stringify(metadata)]
    );
  } catch (err) {
    // Never let activity logging crash the main operation
    logger.error({ err }, 'Failed to log activity');
  }
}