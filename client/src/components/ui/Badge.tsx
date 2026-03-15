import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className 
}) => {
  const variants = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    purple: 'bg-violet-900/40 text-violet-300 border-violet-800/50',
    success: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/50',
    warning: 'bg-amber-900/40 text-amber-300 border-amber-800/50',
    danger: 'bg-red-900/40 text-red-300 border-red-800/50',
    outline: 'bg-transparent text-zinc-400 border-zinc-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    low: { label: 'Low', variant: 'success' },
    medium: { label: 'Medium', variant: 'warning' },
    high: { label: 'High', variant: 'danger' },
    urgent: { label: 'Urgent', variant: 'danger' },
  };

  const config = map[priority.toLowerCase()] || { label: priority, variant: 'default' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const labels: Record<string, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
  };

  return <Badge variant="outline">{labels[status.toLowerCase()] || status}</Badge>;
};
