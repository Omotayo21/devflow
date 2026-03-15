import { format, formatDistanceToNow, formatRelative } from 'date-fns';

export const formatDate = (date: string | Date, pattern: string = 'MMM dd, yyyy') => {
  return format(new Date(date), pattern);
};

export const timeAgo = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatRelativeDate = (date: string | Date) => {
  return formatRelative(new Date(date), new Date());
};
