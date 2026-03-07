import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Layout, MapPin, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceApi } from '../../api/workspaceApi';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export default function Workspaces() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceApi.getAll,
  });

  const workspaces = data?.data?.workspaces || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Workspaces</h2>
          <p className="text-muted text-sm">Select a workspace to manage your projects and team.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Create Workspace</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-6 h-48 animate-pulse bg-background-tertiary/20" />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto mt-12 bg-background-secondary/30 border-dashed border-2">
          <div className="p-4 rounded-full bg-brand/10 text-brand">
            <Layout size={48} />
          </div>
          <h3 className="text-xl font-bold">No workspaces found</h3>
          <p className="text-muted">You haven't created or joined any workspaces yet. Create your first workspace to start collaborating with your team.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            Create My First Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <WorkspaceCard 
              key={workspace.id} 
              workspace={workspace} 
              onClick={() => navigate(`/workspaces/${workspace.id}`)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateWorkspaceModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            queryClient.invalidateQueries(['workspaces']);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function WorkspaceCard({ workspace, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="glass-card p-6 group cursor-pointer hover:border-brand/50 hover:bg-background-tertiary transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-background-tertiary border border-border flex items-center justify-center font-bold text-brand group-hover:bg-brand group-hover:text-white transition-all">
          {workspace.name[0]}
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border",
          workspace.my_role === 'owner' ? 'border-brand/30 text-brand bg-brand/5' : 'border-muted/30 text-muted'
        )}>
          {workspace.my_role}
        </span>
      </div>
      
      <h3 className="text-lg font-bold truncate group-hover:text-brand transition-colors mb-1">{workspace.name}</h3>
      <p className="text-sm text-muted line-clamp-2 min-h-[2.5rem] mb-6">{workspace.description || 'No description provided'}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Users size={14} />
          <span>{workspace.member_count} members</span>
        </div>
        <ArrowRight size={16} className="text-muted group-hover:translate-x-1 group-hover:text-white transition-all" />
      </div>
    </div>
  );
}

function CreateWorkspaceModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await workspaceApi.create({ name, description });
      toast.success('Workspace created!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-card p-8 animate-slide-up">
        <h3 className="text-xl font-bold mb-1">Create New Workspace</h3>
        <p className="text-muted text-sm mb-6">A workspace helps you organize projects and teams.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted ml-1">Workspace Name</label>
            <input 
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Studio"
              className="form-input"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted ml-1">Description (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workspace is about..."
              className="form-input min-h-[100px] py-3 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !name.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
