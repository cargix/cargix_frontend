import { format, formatDistanceToNow, parseISO } from 'date-fns';

// ── Date helpers ──────────────────────────────────────────────────────────────
export const formatDate = (date, pattern = 'MMM dd, yyyy') => {
  if (!date) return '—';
  try { return format(parseISO(date), pattern); } catch { return '—'; }
};

export const formatDateTime = (date) => formatDate(date, 'MMM dd, yyyy HH:mm');

export const timeAgo = (date) => {
  if (!date) return '—';
  try { return formatDistanceToNow(parseISO(date), { addSuffix: true }); } catch { return '—'; }
};

// ── Currency helpers ──────────────────────────────────────────────────────────
export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(
    amount ?? 0
  );

export const formatNumber = (num) =>
  new Intl.NumberFormat('en-US').format(num ?? 0);

// ── Status helpers ────────────────────────────────────────────────────────────
export const orderStatusColor = (status) =>
  ({
    pending:    'warning',
    accepted:   'primary',
    in_transit: 'accent',
    delivered:  'success',
    cancelled:  'danger',
    rejected:   'danger',
  }[status] || 'default');

export const companyStatusColor = (status) =>
  ({
    approved: 'success',
    pending:  'warning',
    rejected: 'danger',
  }[status] || 'default');

export const vehicleStatusColor = (status) =>
  ({
    available:   'success',
    in_use:      'primary',
    maintenance: 'warning',
    inactive:    'danger',
  }[status] || 'default');

export const driverStatusColor = (status) =>
  ({
    available: 'success',
    on_duty:   'primary',
    off_duty:  'warning',
    inactive:  'danger',
  }[status] || 'default');

export const complaintStatusColor = (status) =>
  ({
    open:        'danger',
    in_progress: 'warning',
    resolved:    'success',
    closed:      'default',
  }[status] || 'default');

// ── String helpers ────────────────────────────────────────────────────────────
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ') : '';

export const initials = (name) =>
  name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

// ── Array helpers ─────────────────────────────────────────────────────────────
export const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

// ── Error message extractor ───────────────────────────────────────────────────
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong';
