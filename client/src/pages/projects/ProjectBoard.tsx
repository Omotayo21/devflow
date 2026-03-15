import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  MessageSquare, 
  X,
  ChevronRight,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { getProjectById } from '../../api/projects';
import { getTasks, createTask, updateTask, getComments, addComment, deleteComment } from '../../api/tasks';
import { getWorkspaceById } from '../../api/workspaces';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { PriorityBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { formatRelativeDate } from '../../utils/formatters';
import { Task } from '../../types';

export default function ProjectBoard() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string, projectId: string }>();
  const navigate = useNavigate();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: workspaceResponse } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => getWorkspaceById(workspaceId!),
    enabled: !!workspaceId,
  });

  const { data: projectResponse } = useQuery({
    queryKey: ['project', workspaceId, projectId],
    queryFn: () => getProjectById(workspaceId!, projectId!),
    enabled: !!workspaceId && !!projectId,
  });

  const { data: tasksResponse, isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasks(projectId!),
    enabled: !!projectId,
  });

  const workspace = workspaceResponse?.data;
  const project = projectResponse?.data?.project;
  const tasks = tasksResponse?.data?.tasks || [];

  const columns = [
    { id: 'todo', label: 'Todo', icon: AlertCircle, color: 'text-zinc-500' },
    { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-400' },
    { id: 'in_review', label: 'In Review', icon: MessageSquare, color: 'text-amber-400' },
    { id: 'done', label: 'Done', icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      {/* Board Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
            <span className="cursor-pointer hover:text-zinc-400" onClick={() => navigate('/workspaces')}>Workspaces</span>
            <ChevronRight size={12} className="text-zinc-800" />
            <span className="cursor-pointer hover:text-zinc-400" onClick={() => navigate(`/workspaces/${workspaceId}`)}>
              {workspace?.name || 'Workspace'}
            </span>
            <ChevronRight size={12} className="text-zinc-800" />
            <span className="text-zinc-400">{project?.name || 'Project'}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white selection:bg-violet-500/30">
            {project?.name || 'Project Board'}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2 border-zinc-800 hover:bg-zinc-900">
            <Filter size={16} />
            Filter
          </Button>
          <Button onClick={() => setIsAddOpen(true)} size="sm" className="flex items-center gap-2">
            <Plus size={16} />
            Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
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
          projectId={projectId!}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* Add Task Slide-over */}
      {isAddOpen && (
        <AddTaskSlideOver 
          projectId={projectId!}
          onClose={() => setIsAddOpen(false)}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

interface BoardColumnProps {
  column: { id: string; label: string; icon: any; color: string };
  tasks: Task[];
  onTaskClick: (id: string) => void;
}

function BoardColumn({ column, tasks, onTaskClick }: BoardColumnProps) {
  return (
    <div className="w-80 shrink-0 flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <column.icon size={16} className={column.color} />
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">{column.label}</h3>
          <span className="text-[10px] font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
            {tasks.length}
          </span>
        </div>
        <button className="text-zinc-600 hover:text-zinc-100 transition-colors p-1 hover:bg-zinc-900 rounded-md">
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-[200px] p-2 rounded-2xl bg-zinc-950/20 border border-transparent hover:border-zinc-900/50 transition-colors">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-zinc-900 flex-1 flex items-center justify-center p-8">
            <p className="text-[11px] text-zinc-700 font-bold uppercase tracking-widest italic">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl hover:border-violet-500/40 group cursor-pointer transition-all duration-300 shadow-sm hover:shadow-violet-500/5 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-3">
        <PriorityBadge priority={task.priority} />
        <button className="text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-900 rounded">
          <MoreHorizontal size={14} />
        </button>
      </div>
      
      <h4 className="text-sm font-semibold text-zinc-200 mb-4 group-hover:text-white transition-colors line-clamp-2 leading-snug">
        {task.title}
      </h4>
      
      <div className="flex items-center justify-between pt-3 border-t border-zinc-900 mt-auto">
        <div className="flex items-center gap-3">
          {task.due_date && (
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter flex items-center gap-1.5">
              <Calendar size={12} className="text-zinc-700" />
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
          <span className="text-[10px] text-zinc-600 font-bold flex items-center gap-1.5">
            <MessageSquare size={12} className="text-zinc-700" />
            {task.comment_count || 0}
          </span>
        </div>
        <Avatar name={task.assignee_name || '?'} size="xs" />
      </div>
    </div>
  );
}

interface SlideOverProps {
  taskId: string;
  projectId: string;
  onClose: () => void;
}

function TaskDetailSlideOver({ taskId, projectId, onClose }: SlideOverProps) {
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState('');

  const { data: taskResponse, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTasks(projectId).then(res => res.data.tasks.find(t => t.id === taskId)),
  });

  const { data: commentsResponse } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => getComments(projectId, taskId),
    enabled: !!taskId,
  });

  const task = taskResponse;
  const comments = commentsResponse?.data?.comments || [];

  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string }) => addComment(projectId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setCommentContent('');
      toast.success('Comment added');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: Partial<Task>) => updateTask(projectId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('Task updated');
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(projectId, taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      toast.success('Comment deleted');
    }
  });

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-xl bg-zinc-950 border-l border-zinc-900 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-violet-500/10 rounded-xl">
              <CheckCircle2 className="text-violet-400" size={18} />
            </span>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Task Details</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-zinc-900 text-zinc-500 hover:text-zinc-100 transition-all font-bold"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-32">
          {taskLoading ? (
            <div className="flex items-center justify-center p-12">
              <Spinner size="md" />
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-2xl font-bold text-white mb-6 leading-tight">{task?.title}</h3>
                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-2">
                    <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest px-1">Status</p>
                    <select 
                      value={task?.status}
                      onChange={(e) => updateTaskMutation.mutate({ status: e.target.value as any })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all cursor-pointer appearance-none lowercase"
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest px-1">Priority</p>
                    <select 
                      value={task?.priority}
                      onChange={(e) => updateTaskMutation.mutate({ priority: e.target.value as any })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all cursor-pointer appearance-none lowercase"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest px-1">Assignee</p>
                    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                      <Avatar name={task?.assignee_name || '?'} size="xs" />
                      <span className="text-sm font-semibold text-zinc-300 truncate">{task?.assignee_name || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest px-1">Due Date</p>
                    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
                      <Calendar size={14} className="text-zinc-600" />
                      <span className="text-sm font-semibold text-zinc-300">
                        {task?.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date set'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest px-1 mb-4">Description</p>
                <div className="text-zinc-300 text-sm leading-relaxed bg-zinc-900/40 p-6 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all min-h-[120px]">
                  {task?.description || <span className="text-zinc-700 italic font-medium">No description provided.</span>}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <p className="text-zinc-100 text-sm font-bold">Comments</p>
                  <span className="text-[10px] font-bold bg-zinc-900 px-2 py-0.5 rounded-full text-zinc-500">{comments.length}</span>
                </div>
                <div className="space-y-8 pl-1">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 group">
                      <Avatar name={comment.user_name} size="sm" />
                      <div className="flex-1 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-900 group-hover:bg-zinc-900/80 transition-all relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-zinc-200">{comment.user_name}</span>
                          <span className="text-[10px] text-zinc-600 font-medium">
                            {formatRelativeDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed font-medium">{comment.content}</p>
                        <button 
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          className="absolute -top-2 -right-2 p-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-xs text-zinc-700 font-bold uppercase tracking-widest italic">No comments yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer / Input */}
        <div className="p-6 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-xl absolute bottom-0 left-0 right-0 z-20">
          <form 
            onSubmit={(e) => { e.preventDefault(); if(commentContent.trim()) addCommentMutation.mutate({ content: commentContent }); }}
            className="relative"
          >
            <input 
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 pr-16 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all shadow-inner"
            />
            <button 
               type="submit"
               disabled={!commentContent.trim() || addCommentMutation.isPending}
               className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all disabled:opacity-50 disabled:bg-zinc-800 shadow-lg shadow-violet-600/20"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AddTaskSlideOver({ projectId, onClose }: { projectId: string, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    due_date: ''
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<Task>) => createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Task created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-900 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Create Task</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-900 text-zinc-500 transition-all"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <Input 
            autoFocus
            label="Task Title"
            placeholder="e.g. Design system audit"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            className="text-lg font-semibold"
          />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Status</label>
              <select 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all appearance-none cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Priority</label>
              <select 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all appearance-none cursor-pointer"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <Input 
            type="date"
            label="Due Date"
            value={formData.due_date}
            onChange={(e) => setFormData({...formData, due_date: e.target.value})}
          />

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 font-mono">Description</label>
            <textarea 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all min-h-[160px] resize-none leading-relaxed" 
              placeholder="Add more details about this task..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-8 flex gap-4">
             <Button variant="outline" onClick={onClose} className="flex-1 border-zinc-800">Cancel</Button>
             <Button type="submit" isLoading={mutation.isPending} className="flex-1">Create Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
