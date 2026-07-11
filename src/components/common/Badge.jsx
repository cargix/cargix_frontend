import { clsx } from 'clsx';
import { capitalize } from '@/utils/helpers';

const colorMap = {
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  accent:  'bg-accent-100 text-accent-600 dark:bg-orange-900/30 dark:text-orange-300',
  success: 'bg-success/10 text-success dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-warning/10 text-warning dark:bg-amber-900/30 dark:text-amber-400',
  danger:  'bg-danger/10 text-danger dark:bg-red-900/30 dark:text-red-400',
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  purple:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  cyan:    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
};

const dotMap = {
  primary: 'bg-primary-600',
  accent:  'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
  default: 'bg-slate-400',
  purple:  'bg-purple-600',
  cyan:    'bg-cyan-600',
};

const Badge = ({
  label,
  color = 'default',
  dot = false,
  pulse = false,
  size = 'md',
  className,
}) => {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={clsx('badge', colorMap[color] || colorMap.default, sizeClass, className)}>
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dotMap[color], pulse && 'animate-pulse')} />
      )}
      {capitalize(label || color)}
    </span>
  );
};

// ── Status-specific exports ───────────────────────────────────────────────────
export const OrderBadge = ({ status }) => {
  const map = { pending: 'warning', accepted: 'primary', in_transit: 'accent', delivered: 'success', cancelled: 'danger', rejected: 'danger' };
  return <Badge label={status} color={map[status] || 'default'} dot />;
};

export const CompanyBadge = ({ status }) => {
  const map = { approved: 'success', pending: 'warning', rejected: 'danger' };
  return <Badge label={status} color={map[status] || 'default'} dot />;
};

export const VehicleBadge = ({ status }) => {
  const map = { available: 'success', in_use: 'primary', maintenance: 'warning', inactive: 'danger' };
  return <Badge label={status?.replace('_', ' ')} color={map[status] || 'default'} dot />;
};

export const DriverBadge = ({ status }) => {
  const map = { available: 'success', on_duty: 'primary', off_duty: 'warning', inactive: 'danger' };
  return <Badge label={status?.replace('_', ' ')} color={map[status] || 'default'} dot />;
};

export const ComplaintBadge = ({ status }) => {
  const map = { open: 'danger', in_progress: 'warning', resolved: 'success', closed: 'default' };
  return <Badge label={status?.replace('_', ' ')} color={map[status] || 'default'} dot />;
};

export const PriorityBadge = ({ priority }) => {
  const map = { low: 'success', medium: 'warning', high: 'accent', critical: 'danger' };
  return <Badge label={priority} color={map[priority] || 'default'} />;
};

export default Badge;
