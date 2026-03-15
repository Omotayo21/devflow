import React from 'react';
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  FolderKanban, 
  Users,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../utils/cn';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Badge, PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { formatRelativeDate } from '../../utils/formatters';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { activeWorkspaceId } = useUIStore();

  const stats = [
    { label: 'Total Projects', value: 12, icon: FolderKanban, color: 'text-violet-500' },
    { label: 'Active Tasks', value: 48, icon: Clock, color: 'text-orange-400' },
    { label: 'Completed', value: 156, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Team Members', value: 8, icon: Users, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white selection:bg-violet-500/30">
            Good evening, {user?.name.split(' ')[0]} 👋
          </h2>
          <p className="text-zinc-500 mt-1">Here's what's happening in your workspace today.</p>
        </div>
        <Button className="flex items-center gap-2 shadow-lg shadow-violet-600/20">
          <Plus size={18} />
          New Task
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        {/* Recent Activity */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col shadow-sm">
          <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <TrendingUp size={18} className="text-violet-400" />
              </div>
              <h3 className="font-semibold text-zinc-100">Recent Activity</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300">
              View All
            </Button>
          </div>
          <div className="flex-1 p-6 space-y-6">
            <ActivityItem 
              user="Alex Rivera"
              action="updated status of"
              target="Dashboard Redesign"
              time={new Date(Date.now() - 7200000).toISOString()}
            />
            <ActivityItem 
              user="Sarah Chen"
              action="commented on"
              target="API Documentation"
              time={new Date(Date.now() - 18000000).toISOString()}
            />
            <ActivityItem 
              user="Marcus Wright"
              action="completed"
              target="User Auth Flow"
              time={new Date(Date.now() - 86400000).toISOString()}
            />
          </div>
        </div>

        {/* Assigned Tasks */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col shadow-sm">
          <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FolderKanban size={18} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-zinc-100">My Tasks</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
              Go to Board
            </Button>
          </div>
          <div className="flex-1 p-6 space-y-4">
            <TaskPreview 
              title="Design System Refresh" 
              project="Web App"
              priority="urgent"
              status="in_progress"
            />
            <TaskPreview 
              title="Implement Task Slide-over" 
              project="DevFlow"
              priority="high"
              status="todo"
            />
            <TaskPreview 
              title="Mobile Responsive fixes" 
              project="Marketing Site"
              priority="medium"
              status="in_progress"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  user: string;
  action: string;
  target: string;
  time: string;
}

function ActivityItem({ user, action, target, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4">
      <Avatar name={user} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-tight text-zinc-300">
          <span className="font-semibold text-zinc-100">{user}</span>{' '}
          {action}{' '}
          <span className="text-violet-400 hover:underline cursor-pointer font-medium">{target}</span>
        </p>
        <span className="text-xs text-zinc-600 mt-1 block tracking-tight">
          {formatRelativeDate(time)}
        </span>
      </div>
    </div>
  );
}

interface TaskPreviewProps {
  title: string;
  project: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
}

function TaskPreview({ title, project, priority, status }: TaskPreviewProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 transition-all cursor-pointer group">
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="text-sm font-semibold text-zinc-200 truncate group-hover:text-violet-400 transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-zinc-500">{project}</p>
          <span className="text-zinc-700 text-xs text-[8px]">•</span>
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <PriorityBadge priority={priority} />
        <ExternalLink size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
      </div>
    </div>
  );
}
