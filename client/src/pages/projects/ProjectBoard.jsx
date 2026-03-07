import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  MessageSquare, 
  Loader2,
  X,
  ChevronRight,
  Send,
  Trash2
} from 'lucide-react';
import { projectApi } from '../../api/projectApi';
import { taskApi } from '../../api/taskApi';
import { workspaceApi } from '../../api/workspaceApi';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export default function ProjectBoard() {
  const { workspaceId, projectId } = useParams();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Project Info
  const { data: projectData } = useQuery({
    queryKey: ['project', workspaceId, projectId],
    queryFn: () => projectApi.getById(workspaceId, projectId),
  });

  // Fetch Tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskApi.getByProject(projectId),
  });

  const project = projectData?.data?.project;
  const tasks = tasksData?.data?.tasks || [];

  const columns = [
    { id: 'todo', label: 'Todo' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'in_review', label: 'In Review' },
    { id: 'done', label: 'Done' },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6 animate-fade-in">
      {/* Board Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-1">
            <span>Workspaces</span>
            <ChevronRight size={12} />
            <span>Workspace</span>
            <ChevronRight size={12} />
            <span className="text-white">Project</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{project?.name || 'Project Board'}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm flex items-center gap-2">
            <Filter size={16} />
            Filter
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="btn-primary btn-sm flex items-center gap-2"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {columns.map((column) => (
          <BoardColumn 
            key={column.id} 
            column={column} 
            tasks={tasks.filter(t => t.status === column.id)}
            onTaskClick={(id) => setSelectedTaskId(id)}
          />
        ))}
      </div>

      {/* Task Detail Slide-over */}
      {selectedTaskId && (
        <TaskDetailSlideOver 
          taskId={selectedTaskId}
          projectId={projectId}
          workspaceId={workspaceId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* Add Task Slide-over */}
      {isAddOpen && (
        <AddTaskSlideOver 
          projectId={projectId}
          workspaceId={workspaceId}
          onClose={() => setIsAddOpen(false)}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function BoardColumn({ column, tasks, onTaskClick }) {
  return (
    <div className="w-80 shrink-0 flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">{column.label}</h3>
          <span className="text-xs bg-background-tertiary px-1.5 py-0.5 rounded-full text-white/50">{tasks.length}</span>
        </div>
        <button className="text-muted hover:text-white transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-[100px]">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted/30 italic">
            No tasks here
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onClick }) {
  const priorityColors = {
    urgent: 'bg-red-400',
    high: 'bg-orange-400',
    medium: 'bg-blue-400',
    low: 'bg-emerald-400',
  };

  return (
    <div 
      onClick={onClick}
      className="glass-card p-4 hover:border-brand/40 group cursor-pointer transition-all animate-fade-in"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("px-2 py-0.5 rounded-full text-[9px] uppercase font-black text-white/90", priorityColors[task.priority])}>
          {task.priority}
        </div>
        <button className="text-muted opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={14} />
        </button>
      </div>
      
      <h4 className="text-sm font-semibold mb-3 group-hover:text-brand transition-colors line-clamp-2">{task.title}</h4>
      
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-3">
          {task.due_date && (
            <span className="text-[10px] text-muted flex items-center gap-1">
              <Calendar size={12} />
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
          <span className="text-[10px] text-muted flex items-center gap-1">
            <MessageSquare size={12} />
            {task.comment_count || 0}
          </span>
        </div>
        <div className="w-6 h-6 rounded-full bg-background-tertiary border border-border flex items-center justify-center text-[10px] font-bold text-brand">
          {task.assignee_name?.[0] || '?'}
        </div>
      </div>
    </div>
  );
}

function TaskDetailSlideOver({ taskId, projectId, workspaceId, onClose }) {
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState('');

  const { data: taskData, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskApi.getByProject(projectId).then(res => res.data.tasks.find(t => t.id === taskId)),
  });

  const { data: commentsData } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => taskApi.getComments(projectId, taskId),
  });

  const task = taskData;
  const comments = commentsData?.data?.comments || [];

  const addCommentMutation = useMutation({
    mutationFn: () => taskApi.addComment(projectId, taskId, { content: commentContent }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', taskId]);
      setCommentContent('');
      toast.success('Comment added');
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-background-secondary border-l border-border h-full flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-brand uppercase tracking-widest">
            <span className="p-1.5 bg-brand/10 rounded-lg">Task Detail</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-background-tertiary transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">{task?.title}</h3>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-1">
                <p className="text-muted text-xs uppercase font-bold tracking-wider">Status</p>
                <div className="capitalize font-medium text-white">{task?.status.replace('_', ' ')}</div>
              </div>
              <div className="space-y-1">
                <p className="text-muted text-xs uppercase font-bold tracking-wider">Priority</p>
                <div className="capitalize font-medium text-white">{task?.priority}</div>
              </div>
              <div className="space-y-1">
                <p className="text-muted text-xs uppercase font-bold tracking-wider">Assignee</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-[10px] font-bold">{task?.assignee_name?.[0] || '?'}</div>
                  <span className="font-medium">{task?.assignee_name || 'Unassigned'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted text-xs uppercase font-bold tracking-wider">Due Date</p>
                <div className="font-medium text-white">{task?.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date set'}</div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-muted text-xs uppercase font-bold tracking-wider mb-2">Description</p>
            <div className="text-white/90 leading-relaxed bg-background-tertiary/30 p-4 rounded-xl border border-border/50">
              {task?.description || 'No description provided.'}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-muted text-xs uppercase font-bold tracking-wider">Comments ({comments.length})</p>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-background-tertiary border border-border flex items-center justify-center text-xs font-bold shrink-0">{comment.user_name[0]}</div>
                  <div className="flex-1 bg-background-tertiary/50 p-3 rounded-2xl rounded-tl-none border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{comment.user_name}</span>
                      <span className="text-[10px] text-muted">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-white/80">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer / Input */}
        <div className="p-6 border-t border-border bg-background-secondary sticky bottom-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); if(commentContent.trim()) addCommentMutation.mutate(); }}
            className="relative"
          >
            <input 
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="form-input pr-12 h-12 rounded-2xl bg-background-tertiary"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-brand hover:bg-brand-light text-white transition-all">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AddTaskSlideOver({ projectId, workspaceId, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: ''
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => taskApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', projectId]);
      toast.success('Task created successfully!');
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background-secondary border-l border-border h-full flex flex-col shadow-2xl animate-slide-in-right">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold">New Task</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-background-tertiary transition-colors"><X size={20} /></button>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); createTaskMutation.mutate(formData); }}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Task Title</label>
            <input 
              autoFocus
              className="form-input text-lg font-bold" 
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Status</label>
              <select 
                className="form-input cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Priority</label>
              <select 
                className="form-input cursor-pointer text-orange-400"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent" className="text-red-500">Urgent</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Due Date</label>
            <input 
              type="date"
              className="form-input cursor-pointer" 
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Description</label>
            <textarea 
              className="form-input min-h-[150px] py-3 resize-none" 
              placeholder="Add more details about this task..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-6 flex gap-3">
             <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
             <button type="submit" disabled={createTaskMutation.isPending} className="btn-primary flex-1">
               {createTaskMutation.isPending ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Create Task'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
