import { motion } from 'framer-motion';
import { Loader2, Truck } from 'lucide-react';
import { clsx } from 'clsx';

// ── Full-page loader ──────────────────────────────────────────────────────────
export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
      className="mb-4"
    >
      <Truck className="w-10 h-10 text-primary-700" />
    </motion.div>
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>
  </div>
);

// ── Inline spinner ────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  return <Loader2 className={clsx('animate-spin text-primary-600', sizes[size], className)} />;
};

// ── Skeleton line ─────────────────────────────────────────────────────────────
export const SkeletonLine = ({ width = 'full', height = 4, className }) => (
  <div
    className={clsx(
      'shimmer-bg rounded',
      `h-${height}`,
      width === 'full' ? 'w-full' : `w-${width}`,
      className
    )}
  />
);

// ── Skeleton card ─────────────────────────────────────────────────────────────
export const SkeletonCard = ({ className }) => (
  <div className={clsx('bg-white dark:bg-dark-card rounded-2xl p-5 border border-light-border dark:border-dark-border', className)}>
    <div className="flex items-center gap-3 mb-4">
      <div className="shimmer-bg w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="3/4" height={3} />
        <SkeletonLine width="1/2" height={3} />
      </div>
    </div>
    <SkeletonLine height={8} className="mb-3" />
    <SkeletonLine width="2/3" height={3} />
  </div>
);

// ── Stats skeleton grid ───────────────────────────────────────────────────────
export const StatsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// ── Table skeleton ────────────────────────────────────────────────────────────
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="overflow-hidden rounded-xl border border-light-border dark:border-dark-border">
    <div className="bg-slate-50 dark:bg-dark-card2 px-4 py-3 flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex-1 h-3 shimmer-bg rounded" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3 border-t border-light-border dark:border-dark-border">
        {Array.from({ length: cols }).map((__, j) => (
          <div key={j} className="flex-1 h-4 shimmer-bg rounded" />
        ))}
      </div>
    ))}
  </div>
);

export default PageLoader;
