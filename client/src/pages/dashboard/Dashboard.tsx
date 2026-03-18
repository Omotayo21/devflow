import { useQuery } from '@tanstack/react-query';
import { 
  FolderKanban, 
  Users,
  TrendingUp,
  ExternalLink,
  Building2,
  Plus
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../utils/cn';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Badge, PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRelativeDate } from '../../utils/formatters';
import { getWorkspaces } from '../../api/workspaces';
import { getWorkspaceActivity } from '../../api/activities';
import { useNavigate } from 'react-router-dom';
import { Activity } from '../../types';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { activeWorkspaceId } = useUIStore();
  const navigate = useNavigate();

  const { data: workspacesResponse, isLoading: wsLoading } = useQuery({
    queryKey: ['workspaces', user?.id],
    queryFn: getWorkspaces,
    enabled: !!user?.id,
  });

  const workspaces = (workspacesResponse as any)?.data?.workspaces || [];

  const { data: activityResponse, isLoading: actLoading } = useQuery({
    queryKey: ['activity', user?.id, activeWorkspaceId],
    queryFn: () => getWorkspaceActivity(activeWorkspaceId!, { limit: 5 }),
    enabled: !!user?.id && !!activeWorkspaceId,
  });

  const activities = (activityResponse as any)?.data?.activities || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    { label: 'Workspaces', value: workspaces.length, icon: Building2, color: 'text-violet-500' },
    { label: 'Total Members', value: workspaces.reduce((acc: number, w: any) => acc + parseInt(w.member_count || 0), 0), icon: Users, color: 'text-blue-400' },
  ];

  if (wsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white selection:bg-violet-500/30">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-zinc-500 mt-1">Here's what's happening across your workspaces.</p>
        </div>
        <Button 
          onClick={() => navigate('/workspaces')}
          className="flex items-center gap-2 shadow-lg shadow-violet-600/20"
        >
          <Plus size={18} />
          New Workspace
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex items-start justify-between group cursor-default hover:border-zinc-800 transition-all duration-300">
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-2">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
            <div className={cn("p-2.5 rounded-xl bg-zinc-900 transition-colors group-hover:bg-zinc-800", stat.color)}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Workspaces */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col shadow-sm">
          <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <Building2 size={18} className="text-violet-400" />
              </div>
              <h3 className="font-semibold text-zinc-100">Your Workspaces</h3>
            </div>
            <Button 
              variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300"
              onClick={() => navigate('/workspaces')}
            >
              View All
            </Button>
          </div>
          <div className="flex-1 p-6 space-y-4">
            {workspaces.length === 0 ? (
              <p className="text-sm text-zinc-600 text-center py-8 italic">No workspaces yet. Create one to get started!</p>
            ) : (
              workspaces.slice(0, 5).map((w: any) => (
                <div 
                  key={w.id} 
                  onClick={() => navigate(`/workspaces/${w.id}`)}
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {w.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-200 truncate group-hover:text-violet-400 transition-colors">{w.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={w.my_role === 'owner' ? 'purple' : 'default'} className="text-[9px] uppercase">{w.my_role}</Badge>
                        <span className="text-[10px] text-zinc-600">{w.member_count} members</span>
                      </div>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col shadow-sm">
          <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <TrendingUp size={18} className="text-violet-400" />
              </div>
              <h3 className="font-semibold text-zinc-100">Recent Activity</h3>
            </div>
          </div>
          <div className="flex-1 p-6 space-y-6">
            {!activeWorkspaceId ? (
              <p className="text-sm text-zinc-600 text-center py-8 italic">Select a workspace to see activity.</p>
            ) : actLoading ? (
              <div className="flex justify-center py-8"><Spinner size="md" /></div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-zinc-600 text-center py-8 italic">No recent activity in this workspace.</p>
            ) : (
              activities.map((activity: Activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <Avatar name={activity.user_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight text-zinc-300">
                      <span className="font-semibold text-zinc-100">{activity.user_name}</span>{' '}
                      {activity.action.replace(/[._]/g, ' ')}{' '}
                      <span className="text-violet-400 font-medium">
                        {activity.metadata?.taskTitle || activity.metadata?.entityName || ''}
                      </span>
                    </p>
                    <span className="text-xs text-zinc-600 mt-1 block tracking-tight">
                      {formatRelativeDate(activity.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
