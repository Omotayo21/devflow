import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge tailwind classes with ease
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date nicely using date-fns
 */
import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(date) {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatRelativeDate(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
