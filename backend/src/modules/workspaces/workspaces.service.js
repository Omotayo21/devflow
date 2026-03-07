import { db } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logActivity } from '../../utils/activity.js';
import { getOrSet, invalidate, invalidatePattern } from '../../utils/cache.js';

export async function createWorkspace({ name, description }, userId) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const workspaceResult = await client.query(
      `INSERT INTO workspaces (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, userId]
    );

    const workspace = workspaceResult.rows[0];

    await client.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [workspace.id, userId]
    );

    await client.query('COMMIT');

    await invalidate(`workspaces:user:${userId}`);

    return workspace;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getUserWorkspaces(userId) {
  return getOrSet(
    `workspaces:user:${userId}`,
    async () => {
      const result = await db.query(
        `SELECT 
          w.*,
          wm.role AS my_role,
          COUNT(DISTINCT wm2.user_id) AS member_count
         FROM workspaces w
         JOIN workspace_members wm ON w.id = wm.workspace_id
         LEFT JOIN workspace_members wm2 ON w.id = wm2.workspace_id
         WHERE wm.user_id = $1
         GROUP BY w.id, wm.role
         ORDER BY w.created_at DESC`,
        [userId]
      );
      return result.rows;
    },
    300
  );
}

export async function getWorkspaceById(workspaceId, userId) {
  return getOrSet(
    `workspace:${workspaceId}:user:${userId}`,
    async () => {
      const result = await db.query(
        `SELECT w.*, wm.role AS my_role
         FROM workspaces w
         JOIN workspace_members wm ON w.id = wm.workspace_id
         WHERE w.id = $1 AND wm.user_id = $2`,
        [workspaceId, userId]
      );
      if (result.rows.length === 0) {
        throw new AppError('Workspace not found or access denied', 404);
      }
      return result.rows[0];
    },
    300
  );
}

export async function inviteMember({ workspaceId, email, role }, requesterId) {
  const requester = await db.query(
    `SELECT role FROM workspace_members 
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, requesterId]
  );

  if (!requester.rows[0] || !['owner', 'admin'].includes(requester.rows[0].role)) {
    throw new AppError('Only owners and admins can invite members', 403);
  }

  const userResult = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (userResult.rows.length === 0) {
    throw new AppError('No user found with that email', 404);
  }

  const invitedUser = userResult.rows[0];

  const existing = await db.query(
    `SELECT id FROM workspace_members 
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, invitedUser.id]
  );

  if (existing.rows.length > 0) {
    throw new AppError('User is already a member', 400);
  }

  await db.query(
    `INSERT INTO workspace_members (workspace_id, user_id, role)
     VALUES ($1, $2, $3)`,
    [workspaceId, invitedUser.id, role || 'member']
  );

  await invalidatePattern(`workspace:${workspaceId}:*`);
  await invalidatePattern(`workspaces:user:*`);

  await logActivity({
    action: 'member.invited',
    entityType: 'workspace',
    entityId: workspaceId,
    userId: requesterId,
    workspaceId,
    metadata: { invitedEmail: email, role },
  });

  return { message: 'Member invited successfully' };
}

export async function getWorkspaceMembers(workspaceId, userId) {
  await getWorkspaceById(workspaceId, userId);

  const result = await db.query(
    `SELECT 
      u.id, u.name, u.email, u.avatar_url,
      wm.role, wm.joined_at
     FROM workspace_members wm
     JOIN users u ON wm.user_id = u.id
     WHERE wm.workspace_id = $1
     ORDER BY wm.joined_at ASC`,
    [workspaceId]
  );

  return result.rows;
}