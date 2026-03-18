import { db } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getOrSet, invalidate, invalidatePattern } from '../../utils/cache.js';

export async function createProject({ name, description, workspaceId }, userId) {
  // Verify user is a member of this workspace
  const member = await db.query(
    `SELECT role FROM workspace_members 
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, userId]
  );

  if (member.rows.length === 0) {
    throw new AppError('You are not a member of this workspace', 403);
  }
  const result = await db.query(
    `INSERT INTO projects (name, description, workspace_id, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, description, workspaceId, userId]
  );

  await invalidate(`projects:workspace:${workspaceId}`);
  return result.rows[0];
}

export async function getWorkspaceProjects(workspaceId, userId) {
  return getOrSet(
    `projects:workspace:${workspaceId}`,
    async () => {
      const result = await db.query(
        `SELECT 
          p.*,
          u.name AS created_by_name,
          COUNT(DISTINCT t.id) AS task_count
         FROM projects p
         JOIN users u ON p.created_by = u.id
         JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
         LEFT JOIN tasks t ON p.id = t.project_id
         WHERE p.workspace_id = $1 AND wm.user_id = $2
         GROUP BY p.id, u.name
         ORDER BY p.created_at DESC`,
        [workspaceId, userId]
      );
      return result.rows;
    },
    300
  );
}

export async function getProjectById(projectId, userId) {
  const result = await db.query(
    `SELECT p.*, u.name AS created_by_name
     FROM projects p
     JOIN users u ON p.created_by = u.id
     JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
     WHERE p.id = $1 AND wm.user_id = $2`,
    [projectId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Project not found or access denied', 404);
  }

  return result.rows[0];
}

export async function updateProject({ name, description, status }, projectId, userId) {
  // Only owner/admin or project creator can update
  const project = await getProjectById(projectId, userId);

  const result = await db.query(
    `UPDATE projects 
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [name, description, status, projectId]
  );

  return result.rows[0];
}

export async function deleteProject(projectId, userId) {
  const project = await getProjectById(projectId, userId);
  
  // Verify access (owner or admin of workspace)
  const member = await db.query(
    'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
    [project.workspace_id, userId]
  );
  
  if (member.rows.length === 0) {
    throw new AppError('Forbidden', 403);
  }
  
  const isOwnerOrAdmin = ['owner', 'admin'].includes(member.rows[0].role);
  const isCreator = project.created_by === userId;

  if (!isOwnerOrAdmin && !isCreator) {
    throw new AppError('Only the project creator or workspace admins can delete this project', 403);
  }

  await db.query('DELETE FROM projects WHERE id = $1', [projectId]);
  await invalidate(`projects:workspace:${project.workspace_id}`);
  
  return { message: 'Project deleted successfully' };
}
