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
import { cn } from '../../utils/cn';

export default function Dashboard() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Total Projects', value: 12, icon: FolderKanban, color: 'text-brand' },
    { label: 'Active Tasks', value: 48, icon: Clock, color: 'text-orange-400' },
    { label: 'Completed', value: 156, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Team Members', value: 8, icon: Users, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Good evening, {user?.name.split(' ')[0]} 👋</h2>
          <p className="text-muted">Here's what's happening with your projects today.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-6 flex items-start justify-between group cursor-default">
            <div>
              <p className="text-sm font-medium text-muted mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
            <div className={cn("p-2 rounded-lg bg-background-tertiary transition-colors group-hover:bg-background-secondary", stat.color)}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="glass-card flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-brand" />
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            <button className="text-xs text-brand hover:text-brand-light font-medium transition-colors">
              View All
            </button>
          </div>
          <div className="flex-1 p-6 space-y-6">
            <ActivityItem 
              user="Alex Rivera"
              action="updated status of"
              target="Dashboard Redesign"
              time="2 hours ago"
            />
            <ActivityItem 
              user="Sarah Chen"
              action="commented on"
              target="API Documentation"
              time="5 hours ago"
            />
            <ActivityItem 
              user="Marcus Wright"
              action="completed"
              target="User Auth Flow"
              time="Yesterday"
            />
          </div>
        </div>

        {/* Assigned Tasks */}
        <div className="glass-card flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban size={20} className="text-brand" />
              <h3 className="font-semibold">My Assigned Tasks</h3>
            </div>
            <button className="text-xs text-brand hover:text-brand-light font-medium transition-colors">
              Go to Board
            </button>
          </div>
          <div className="flex-1 p-6 space-y-4">
            <TaskPreview 
              title="Design System Refresh" 
              project="Web App"
              priority="urgent"
            />
            <TaskPreview 
              title="Implement Task Slide-over" 
              project="DevFlow"
              priority="high"
            />
            <TaskPreview 
              title="Mobile Responsive fixes" 
              project="Marketing Site"
              priority="medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ user, action, target, time }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-background-tertiary border border-border flex items-center justify-center text-xs font-bold shrink-0">
        {user[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-tight text-white/90">
          <span className="font-semibold text-white">{user}</span> {action} <span className="text-brand hover:underline cursor-pointer">{target}</span>
        </p>
        <span className="text-[11px] text-muted">{time}</span>
      </div>
    </div>
  );
}

function TaskPreview({ title, project, priority }) {
  const priorityColors = {
    urgent: 'bg-red-400/10 text-red-300 border-red-500/20',
    high: 'bg-orange-400/10 text-orange-300 border-orange-500/20',
    medium: 'bg-blue-400/10 text-blue-300 border-blue-500/20',
    low: 'bg-emerald-400/10 text-emerald-300 border-emerald-500/20',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/50 hover:bg-background-tertiary border border-transparent hover:border-border transition-all cursor-pointer group">
      <div className="flex-1 min-w-0 p-1">
        <h4 className="text-sm font-medium truncate group-hover:text-brand transition-colors">{title}</h4>
        <p className="text-xs text-muted">{project}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase font-black border", priorityColors[priority])}>
          {priority}
        </div>
        <ExternalLink size={14} className="text-muted group-hover:text-white transition-colors" />
      </div>
    </div>
  );
}
