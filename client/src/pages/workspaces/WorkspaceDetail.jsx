import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  FolderKanban, 
  Users, 
  Activity as ActivityIcon, 
  Plus, 
  Settings,
  Mail,
  Loader2
} from 'lucide-react';
import { workspaceApi } from '../../api/workspaceApi';
import { projectApi } from '../../api/projectApi';
import { activityApi } from '../../api/activityApi';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export default function WorkspaceDetail() {
  const { id: workspaceId } = useParams();
  const [activeTab, setActiveTab] = useState('projects');
  const queryClient = useQueryClient();

  // Fetch workspace details
  const { data: wsData, isLoading: wsLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceApi.getById(workspaceId),
  });

  const workspace = wsData?.data?.workspace;

  if (wsLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand" size={32} /></div>;

  const tabs = [
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'activity', label: 'Activity', icon: ActivityIcon },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center text-white font-bold">
              {workspace?.name[0]}
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{workspace?.name}</h2>
          </div>
          <p className="text-muted max-w-2xl">{workspace?.description || 'No description provided for this workspace.'}</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Settings size={18} />
          Settings
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all",
              activeTab === tab.id 
                ? "border-brand text-brand bg-brand/5" 
                : "border-transparent text-muted hover:text-white hover:bg-background-tertiary"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === 'projects' && <ProjectsTab workspaceId={workspaceId} />}
        {activeTab === 'members' && <MembersTab workspaceId={workspaceId} />}
        {activeTab === 'activity' && <ActivityTab workspaceId={workspaceId} />}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function ProjectsTab({ workspaceId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => projectApi.getByWorkspace(workspaceId),
  });

  const projects = data?.data?.projects || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Active Projects ({projects.length})</h3>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary btn-sm flex items-center gap-2">
          <Plus size={16} />
          New Project
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2].map(i => <div key={i} className="glass-card h-40 bg-background-tertiary/20" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted border-dashed border-2">
          No projects found in this workspace. Create one to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="glass-card p-6 hover:border-brand/50 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-brand uppercase tracking-widest">{project.status}</span>
                <span className="text-[10px] text-muted">{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              <h4 className="font-bold text-lg mb-2 group-hover:text-brand transition-colors">{project.name}</h4>
              <p className="text-sm text-muted line-clamp-2 mb-6">{project.description || 'No description'}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <span className="text-xs text-muted flex items-center gap-1">
                   <Users size={12} /> {project.task_count || 0} tasks
                </span>
                <button className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                  Open <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MembersTab({ workspaceId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => workspaceApi.getMembers(workspaceId),
  });

  const members = data?.data?.members || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Workspace Members ({members.length})</h3>
        <button className="btn-secondary btn-sm flex items-center gap-2">
          <Mail size={16} />
          Invite Member
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-background-secondary/50 text-xs font-bold text-muted uppercase tracking-wider">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-background-tertiary/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-xs font-bold">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                    member.role === 'owner' ? "border-brand/30 text-brand bg-brand/5" : "border-muted/30 text-muted"
                  )}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-muted">
                  {new Date(member.joined_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityTab({ workspaceId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['activity', workspaceId],
    queryFn: () => activityApi.getWorkspaceActivity(workspaceId, { limit: 50 }),
  });

  const activities = data?.data?.activities || [];

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="relative border-l border-border ml-3 pl-8 space-y-8">
        {activities.map((activity) => (
          <div key={activity.id} className="relative">
            <div className="absolute -left-[45px] top-1 w-8 h-8 rounded-full bg-background-secondary border border-border flex items-center justify-center text-xs font-bold ring-4 ring-background">
              {activity.user_name[0]}
            </div>
            <div>
              <p className="text-sm text-white/90">
                <span className="font-bold text-white">{activity.user_name}</span>{' '}
                {activity.action.replace('.', ' ')}{' '}
                <span className="text-brand font-medium">
                  {activity.metadata?.taskTitle || activity.metadata?.entityName || 'item'}
                </span>
              </p>
              <p className="text-xs text-muted mt-1">{new Date(activity.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { ArrowRight } from 'lucide-react';
