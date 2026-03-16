export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  my_role: 'owner' | 'admin' | 'member';
  member_count: number;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  workspace_id: string;
  status: 'active' | 'archived';
  created_by: string;
  created_by_name: string;
  task_count: number;
  created_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string;
  assignee_id: string | null;
  assignee_name: string | null;
  assignee_avatar: string | null;
  created_by: string;
  due_date: string | null;
  dueDate?: string; // For backend updates
  assigneeId?: string; // For backend updates
  comment_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content: string;
  task_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  workspace_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}
