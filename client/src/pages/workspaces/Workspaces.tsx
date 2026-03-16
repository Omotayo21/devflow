import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Layout as LayoutIcon, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWorkspaces, createWorkspace } from '../../api/workspaces';
import { Workspace } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function Workspaces() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: workspacesResponse, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: getWorkspaces,
  });

  const workspaces = (workspacesResponse as any)?.data?.workspaces || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Workspaces</h2>
          <p className="text-zinc-500 mt-1">Manage your team and collaborate on projects.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 shadow-lg shadow-violet-600/20"
        >
          <Plus size={18} />
          Create Workspace
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      ) : workspaces.length === 0 ? (
        <EmptyState
          icon={LayoutIcon}
          title="No workspaces found"
          description="Create your first workspace to start collaborating with your team."
          actionLabel="Create Workspace"
          onAction={() => setIsModalOpen(true)}
        />
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Workspace"
      >
        <p className="text-zinc-500 text-sm mb-6 -mt-2">A workspace helps you organize projects and teams.</p>
        <CreateWorkspaceForm 
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: () => void;
}

function WorkspaceCard({ workspace, onClick }: WorkspaceCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl group cursor-pointer hover:border-violet-500/50 hover:bg-zinc-900/40 transition-all duration-300 shadow-sm"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
          {workspace.name[0]}
        </div>
        <Badge variant={workspace.my_role === 'owner' ? 'purple' : 'default'}>
          {workspace.my_role}
        </Badge>
      </div>
      
      <h3 className="text-lg font-bold text-zinc-100 group-hover:text-violet-400 transition-colors mb-2 truncate">
        {workspace.name}
      </h3>
      <p className="text-sm text-zinc-500 line-clamp-2 min-h-[2.5rem] mb-6">
        {workspace.description || 'No description provided'}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Users size={14} />
          <span>{workspace.member_count} members</span>
        </div>
        <ArrowRight size={16} className="text-zinc-600 group-hover:translate-x-1 group-hover:text-zinc-200 transition-all" />
      </div>
    </div>
  );
}

interface CreateWorkspaceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function CreateWorkspaceForm({ onSuccess, onCancel }: CreateWorkspaceFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      toast.success('Workspace created!');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create workspace');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input 
        label="Workspace Name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Acme Studio"
        required
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400 ml-1">Description (Optional)</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this workspace is about..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all min-h-[100px] resize-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button 
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          type="button"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createMutation.isPending || !name.trim()}
          className="flex-1"
          isLoading={createMutation.isPending}
        >
          Create
        </Button>
      </div>
    </form>
  );
}
