import { db } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';

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

  return result.rows[0];
}

export async function getWorkspaceProjects(workspaceId, userId) {
  // Verify membership
  const member = await db.query(
    `SELECT id FROM workspace_members 
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, userId]
  );

  if (member.rows.length === 0) {
    throw new AppError('Access denied', 403);
  }

  const result = await db.query(
    `SELECT 
      p.*,
      u.name AS created_by_name,
      COUNT(DISTINCT t.id) AS task_count
     FROM projects p
     JOIN users u ON p.created_by = u.id
     LEFT JOIN tasks t ON p.id = t.project_id
     WHERE p.workspace_id = $1
     GROUP BY p.id, u.name
     ORDER BY p.created_at DESC`,
    [workspaceId]
  );

  return result.rows;
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