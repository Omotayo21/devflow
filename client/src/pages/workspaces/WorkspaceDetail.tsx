import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FolderKanban, 
  Users, 
  Activity as ActivityIcon, 
  Plus, 
  Mail,
  ArrowRight,
  TrendingUp,
  Trash2
} from 'lucide-react';
import { Activity } from '../../types';
import { getWorkspaceById, getWorkspaceMembers, inviteMember } from '../../api/workspaces';
import { getProjects, createProject, deleteProject } from '../../api/projects';
import { getWorkspaceActivity } from '../../api/activities';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRelativeDate } from '../../utils/formatters';

export default function WorkspaceDetail() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');

  const { data: workspaceResponse, isLoading: wsLoading, isError } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => getWorkspaceById(workspaceId!),
    enabled: !!workspaceId,
  });

  const workspace = (workspaceResponse as any)?.data?.workspace;

  if (wsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Workspace not found"
        description="The workspace you're looking for doesn't exist or you don't have access."
        actionLabel="Back to Workspaces"
        onAction={() => navigate('/workspaces')}
      />
    );
  }

  const tabs = [
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'activity', label: 'Activity', icon: ActivityIcon },
  ];

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-600/20">
              {workspace.name[0]}
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white selection:bg-violet-500/30">
                {workspace.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="purple" className="text-[10px] uppercase tracking-wider">
                  {workspace.my_role}
                </Badge>
                <span className="text-zinc-700 text-xs">•</span>
                <span className="text-zinc-500 text-xs">{workspace.member_count} members</span>
              </div>
            </div>
          </div>
          <p className="text-zinc-500 max-w-2xl leading-relaxed">
            {workspace.description || 'No description provided for this workspace.'}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-zinc-900">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200",
              activeTab === tab.id 
                ? "border-violet-500 text-violet-400 bg-violet-500/5" 
                : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'projects' && <ProjectsTab workspaceId={workspaceId!} />}
        {activeTab === 'members' && <MembersTab workspaceId={workspaceId!} />}
        {activeTab === 'activity' && <ActivityTab workspaceId={workspaceId!} />}
      </div>
    </div>
  );
}

function ProjectsTab({ workspaceId }: { workspaceId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: projectsResponse, isLoading } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => getProjects(workspaceId),
  });

  const projects = projectsResponse?.data?.projects || [];

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => deleteProject(workspaceId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success('Project deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Active Projects</h3>
        <Button onClick={() => setIsModalOpen(true)} size="sm" className="flex items-center gap-2">
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="bg-zinc-950 border border-zinc-900 rounded-2xl h-48 animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create your first project to start tracking tasks and progress."
          actionLabel="Create Project"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => navigate(`/workspaces/${workspaceId}/projects/${project.id}`)}
              className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl group cursor-pointer hover:border-violet-500/40 transition-all duration-300 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <Badge variant={project.status === 'active' ? 'purple' : 'default'} className="text-[10px] uppercase">
                  {project.status}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-600 font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this project? This will delete all tasks within it.')) {
                        deleteMutation.mutate(project.id);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-lg text-zinc-100 mb-2 group-hover:text-violet-400 transition-colors">
                {project.name}
              </h4>
              <p className="text-sm text-zinc-500 line-clamp-2 mb-6 min-h-[40px]">
                {project.description || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                   <Users size={14} className="text-zinc-600" />
                   {project.task_count || 0} tasks
                </span>
                <span className="text-xs font-bold text-zinc-300 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                  Open board <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <CreateProjectForm 
          workspaceId={workspaceId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function MembersTab({ workspaceId }: { workspaceId: string }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => getWorkspaceMembers(workspaceId),
  });

  const members = response?.data?.members || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Team Members</h3>
        <Button onClick={() => setIsInviteOpen(true)} size="sm" variant="outline" className="flex items-center gap-2 border-zinc-800">
          <Mail size={16} />
          Invite Member
        </Button>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/50 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-900">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <Spinner size="md" />
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 text-sm">
                    No members found in this workspace.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-900/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={member.name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                            {member.name}
                          </p>
                          <p className="text-xs text-zinc-600">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={member.role === 'owner' ? 'purple' : 'default'} className="text-[10px] uppercase">
                        {member.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-zinc-600 font-medium">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Team Member">
        <InviteMemberForm 
          workspaceId={workspaceId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
            setIsInviteOpen(false);
          }}
          onCancel={() => setIsInviteOpen(false)}
        />
      </Modal>
    </div>
  );
}

function ActivityTab({ workspaceId }: { workspaceId: string }) {
  const { data: response, isLoading } = useQuery({
    queryKey: ['activity', workspaceId],
    queryFn: () => getWorkspaceActivity(workspaceId, { limit: 50 }),
  });

  const activities = response?.data?.activities || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="md" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No activity yet"
        description="Activities will appear here as you and your team work on projects."
      />
    );
  }

  const formatActivityAction = (action: string) => {
    switch (action) {
      case 'task.created': return 'created task';
      case 'task.updated': return 'updated task';
      case 'task.deleted': return 'deleted task';
      case 'comment.added': return 'added a comment to';
      case 'comment.updated': return 'updated a comment on';
      case 'comment.deleted': return 'deleted a comment from';
      case 'member.invited': return 'invited';
      case 'project.created': return 'created project';
      default: return action.replace('.', ' ');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative border-l border-zinc-900 ml-5 pl-10 space-y-10 py-4">
        {activities.map((activity: Activity) => (
          <div key={activity.id} className="relative">
            <div className="absolute -left-[58px] top-1">
              <Avatar name={activity.user_name} src={activity.user_avatar} size="sm" />
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl hover:bg-zinc-950/80 transition-all duration-300">
              <p className="text-sm text-zinc-300 leading-relaxed">
                <span className="font-bold text-zinc-100">{activity.user_name}</span>{' '}
                {formatActivityAction(activity.action)}{' '}
                <span className="text-violet-400 font-semibold hover:underline cursor-pointer">
                  {activity.metadata?.taskTitle || activity.metadata?.entityName || activity.metadata?.projectName || 'item'}
                </span>
              </p>
              <p className="text-[11px] text-zinc-600 mt-2 font-medium tracking-tight">
                {formatRelativeDate(activity.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- FORM COMPONENTS ---

function CreateProjectForm({ workspaceId, onSuccess, onCancel }: { workspaceId: string, onSuccess: () => void, onCancel: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const mutation = useMutation({
    mutationFn: (data: any) => createProject(workspaceId, data),
    onSuccess: () => {
      toast.success('Project created!');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate({ name, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input 
        label="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Website Redesign"
        required
        autoFocus
      />
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400 ml-1">Description</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about?"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all min-h-[120px] resize-none"
        />
      </div>
      <div className="flex gap-3 pt-4 border-t border-zinc-900">
        <Button variant="outline" onClick={onCancel} className="flex-1" type="button">Cancel</Button>
        <Button type="submit" className="flex-1" isLoading={mutation.isPending}>Create Project</Button>
      </div>
    </form>
  );
}

function InviteMemberForm({ workspaceId, onSuccess, onCancel }: { workspaceId: string, onSuccess: () => void, onCancel: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  
  const mutation = useMutation({
    mutationFn: (data: any) => inviteMember(workspaceId, data.email, data.role),
    onSuccess: () => {
      toast.success('Invitation sent!');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    mutation.mutate({ email, role });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input 
        type="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
        required
        autoFocus
      />
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400 ml-1">Role</label>
        <select 
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all appearance-none"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <p className="text-[11px] text-zinc-600 mt-2 px-1">
          Admins can manage projects and members. Members can only work on soul projects.
        </p>
      </div>
      <div className="flex gap-3 pt-4 border-t border-zinc-900">
        <Button variant="outline" onClick={onCancel} className="flex-1" type="button">Cancel</Button>
        <Button type="submit" className="flex-1" isLoading={mutation.isPending}>Send Invite</Button>
      </div>
    </form>
  );
}
