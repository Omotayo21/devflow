import { db } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logActivity } from '../../utils/activity.js';
import { emailQueue } from '../../config/queue.js';
import { invalidate } from '../../utils/cache.js';

async function verifyProjectAccess(projectId, userId) {
  const result = await db.query(
    `SELECT p.id, p.workspace_id FROM projects p
     JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
     WHERE p.id = $1 AND wm.user_id = $2`,
    [projectId, userId]
  );
  if (result.rows.length === 0) {
    throw new AppError('Project not found or access denied', 403);
  }
  return result.rows[0];
}

export async function createTask({
  title, description, status, priority,
  assigneeId, dueDate, projectId
}, userId) {
  const project = await verifyProjectAccess(projectId, userId);

  const result = await db.query(
    `INSERT INTO tasks 
      (title, description, status, priority, assignee_id, due_date, project_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [title, description, status || 'todo', priority || 'medium',
     assigneeId || null, dueDate || null, projectId, userId]
  );

  const newTask = result.rows[0];

  // Fire-and-forget background tasks (Log activity)
  try {
    logActivity({
      action: 'task.created',
      entityType: 'task',
      entityId: newTask.id,
      userId,
      workspaceId: project.workspace_id,
      metadata: { taskTitle: title },
    }).catch(err => console.error('Background log error:', err));
  } catch (err) {
    console.error('Task post-creation setup error:', err);
  }

  return newTask;
}

export async function getProjectTasks(projectId, userId, query) {
  await verifyProjectAccess(projectId, userId);

  // Pagination and filters from query params
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;
  const { status, priority, assigneeId } = query;

  // Build dynamic WHERE clause based on filters provided
  const conditions = ['t.project_id = $1'];
  const params = [projectId];
  let paramCount = 2;

  if (status) {
    conditions.push(`t.status = $${paramCount}`);
    params.push(status);
    paramCount++;
  }

  if (priority) {
    conditions.push(`t.priority = $${paramCount}`);
    params.push(priority);
    paramCount++;
  }

  if (assigneeId) {
    conditions.push(`t.assignee_id = $${paramCount}`);
    params.push(assigneeId);
    paramCount++;
  }

  const whereClause = conditions.join(' AND ');

  const [tasksResult, countResult] = await Promise.all([
    db.query(
      `SELECT 
        t.*,
        u.name AS assignee_name,
        u.avatar_url AS assignee_avatar,
        c.name AS created_by_name,
        (SELECT COUNT(*)::INTEGER FROM comments WHERE task_id = t.id) AS comment_count
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id
       JOIN users c ON t.created_by = c.id
       WHERE ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    ),
    db.query(
      `SELECT COUNT(*) FROM tasks t WHERE ${whereClause}`,
      params
    ),
  ]);

  const total = parseInt(countResult.rows[0].count);

  return {
    tasks: tasksResult.rows,
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

export async function updateTask(taskId, updates, userId) {
  const { title, description, status, priority, assigneeId, dueDate } = updates;

  const taskResult = await db.query(
    `SELECT t.*, wm.role FROM tasks t
     JOIN projects p ON t.project_id = p.id
     JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
     WHERE t.id = $1 AND wm.user_id = $2`,
    [taskId, userId]
  );

  if (taskResult.rows.length === 0) {
    throw new AppError('Task not found or access denied', 404);
  }

  const task = taskResult.rows[0];

  // Logic: Member should not be able to assign task, only owners can
  if (assigneeId && assigneeId !== task.assignee_id && task.role !== 'owner') {
    throw new AppError('Only the workspace owner can assign tasks', 403);
  }

  const result = await db.query(
    `UPDATE tasks
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         priority = COALESCE($4, priority),
         assignee_id = COALESCE($5, assignee_id),
         due_date = COALESCE($6, due_date),
         updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [title, description, status, priority, assigneeId, dueDate, taskId]
  );

  // Non-blocking operations: email notification and activity log
  if (assigneeId && assigneeId !== task.assignee_id) {
    // Fire and forget assignment email
    Promise.all([
      db.query('SELECT name, email FROM users WHERE id = $1', [assigneeId]),
      db.query('SELECT name FROM users WHERE id = $1', [userId]),
      db.query('SELECT name FROM projects WHERE id = $1', [task.project_id])
    ]).then(([assignee, assigner, projectData]) => {
      if (assignee.rows[0] && assigner.rows[0] && projectData.rows[0]) {
        emailQueue.add('task.assigned', {
          type: 'task.assigned',
          data: {
            assigneeName: assignee.rows[0].name,
            assigneeEmail: assignee.rows[0].email,
            taskTitle: result.rows[0].title,
            projectName: projectData.rows[0].name,
            assignedByName: assigner.rows[0].name,
          },
        }).catch(err => console.error('Assignment email queue error:', err));
      }
    }).catch(err => console.error('Assignment email data fetch error:', err));
  }

  db.query(
    'SELECT workspace_id FROM projects WHERE id = $1',
    [task.project_id]
  ).then(project => {
    if (project.rows[0]) {
      logActivity({
        action: 'task.updated',
        entityType: 'task',
        entityId: taskId,
        userId,
        workspaceId: project.rows[0].workspace_id,
        metadata: { updates },
      });
    }
  }).catch(err => console.error('Update activity log error:', err));

  return result.rows[0];
}

export async function deleteTask(taskId, userId) {
  const taskResult = await db.query(
    `SELECT t.*, wm.role, p.workspace_id FROM tasks t
     JOIN projects p ON t.project_id = p.id
     JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
     WHERE t.id = $1 AND wm.user_id = $2`,
    [taskId, userId]
  );

  if (taskResult.rows.length === 0) {
    throw new AppError('Task not found or access denied', 404);
  }

  const task = taskResult.rows[0];

  // Logic: Only the workspace owner can delete tasks
  if (task.role !== 'owner') {
    throw new AppError('Only the workspace owner can delete tasks', 403);
  }

  await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);
  
  // Non-blocking invalidation
  invalidate(`projects:workspace:${task.workspace_id}`).catch(err => 
    console.error('Delete invalidation error:', err)
  );

  return { message: 'Task deleted successfully' };
}
export async function createComment({ content, taskId }, userId) {
  // Verify user has access to the task's project
  const task = await db.query(
    `SELECT t.id FROM tasks t
     JOIN projects p ON t.project_id = p.id
     JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
     WHERE t.id = $1 AND wm.user_id = $2`,
    [taskId, userId]
  );

  if (task.rows.length === 0) {
    throw new AppError('Task not found or access denied', 404);
  }

  const result = await db.query(
    `INSERT INTO comments (content, task_id, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [content, taskId, userId]
  );
const taskData = await db.query(
  `SELECT t.project_id, p.workspace_id 
   FROM tasks t
   JOIN projects p ON t.project_id = p.id
   WHERE t.id = $1`,
  [taskId]
);

await logActivity({
  action: 'comment.added',
  entityType: 'comment',
  entityId: result.rows[0].id,
  userId,
  workspaceId: taskData.rows[0].workspace_id,
  metadata: { taskId },
});
  return result.rows[0];
}

export async function getTaskComments(taskId, userId) {
  const task = await db.query(
    `SELECT t.id FROM tasks t
     JOIN projects p ON t.project_id = p.id
     JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
     WHERE t.id = $1 AND wm.user_id = $2`,
    [taskId, userId]
  );

  if (task.rows.length === 0) {
    throw new AppError('Task not found or access denied', 404);
  }

  const result = await db.query(
    `SELECT 
      c.*,
      u.name AS user_name,
      u.avatar_url AS user_avatar
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.task_id = $1
     ORDER BY c.created_at ASC`,
    [taskId]
  );

  return result.rows;
}

export async function deleteComment(commentId, userId) {
  const comment = await db.query(
    'SELECT * FROM comments WHERE id = $1 AND user_id = $2',
    [commentId, userId]
  );

  if (comment.rows.length === 0) {
    throw new AppError('Comment not found or not yours to delete', 404);
  }

  await db.query('DELETE FROM comments WHERE id = $1', [commentId]);
  return { message: 'Comment deleted' };
}

export async function updateComment(commentId, content, userId) {
  const comment = await db.query(
    'SELECT * FROM comments WHERE id = $1 AND user_id = $2',
    [commentId, userId]
  );

  if (comment.rows.length === 0) {
    throw new AppError('Comment not found or not yours to update', 404);
  }

  const result = await db.query(
    `UPDATE comments SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [content, commentId]
  );
  
  return result.rows[0];
}
