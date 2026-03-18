import { db } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getWorkspaceActivity(workspaceId, userId, query) {
  // Prevent "Access Denied" if workspaceId is invalid or loading
  if (!workspaceId || workspaceId === 'null' || workspaceId === 'undefined') {
    return {
      activities: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  // Verify membership
  const member = await db.query(
    `SELECT id FROM workspace_members 
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, userId]
  );

  if (member.rows.length === 0) {
    throw new AppError('Access denied', 403);
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;

  const [activitiesResult, countResult] = await Promise.all([
    db.query(
      `SELECT 
        a.*,
        u.name AS user_name,
        u.avatar_url AS user_avatar
       FROM activities a
       JOIN users u ON a.user_id = u.id
       WHERE a.workspace_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
      [workspaceId, limit, offset]
    ),
    db.query(
      'SELECT COUNT(*) FROM activities WHERE workspace_id = $1',
      [workspaceId]
    ),
  ]);

  const total = parseInt(countResult.rows[0].count);

  return {
    activities: activitiesResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}