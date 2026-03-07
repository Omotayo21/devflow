import { db } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function search(query, workspaceId, userId) {
  if (!query || query.trim().length < 2) {
    throw new AppError('Search query must be at least 2 characters', 400);
  }

  // Verify workspace membership
  const member = await db.query(
    `SELECT id FROM workspace_members 
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, userId]
  );

  if (member.rows.length === 0) {
    throw new AppError('Access denied', 403);
  }

  const searchQuery = query.trim().split(' ').join(' & ');

  const [tasks, projects] = await Promise.all([
    db.query(
      `SELECT 
        t.id, t.title, t.status, t.priority,
        p.name AS project_name,
        ts_rank(t.search_vector, to_tsquery('english', $1)) AS rank
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.workspace_id = $2
         AND t.search_vector @@ to_tsquery('english', $1)
       ORDER BY rank DESC
       LIMIT 10`,
      [searchQuery, workspaceId]
    ),
    db.query(
      `SELECT 
        p.id, p.name, p.description, p.status,
        ts_rank(p.search_vector, to_tsquery('english', $1)) AS rank
       FROM projects p
       WHERE p.workspace_id = $2
         AND p.search_vector @@ to_tsquery('english', $1)
       ORDER BY rank DESC
       LIMIT 10`,
      [searchQuery, workspaceId]
    ),
  ]);

  return {
    tasks: tasks.rows,
    projects: projects.rows,
    total: tasks.rows.length + projects.rows.length,
  };
}
