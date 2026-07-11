import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { formatNumber } from '@/utils/helpers';

// ── Animated counter hook ─────────────────────────────────────────────────────
const useCounter = (end, duration = 1500) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    let startTime = null;
    const startVal = 0;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startVal + (end - startVal) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);

  return count;
};

// ── StatCard ──────────────────────────────────────────────────────────────────
const StatCard = ({
  title,
  value = 0,
  icon: Icon,
  trend,
  trendLabel,
  color = 'primary',
  prefix = '',
  suffix = '',
  format = true,
  delay = 0,
  onClick,
  className,
}) => {
  const animated = useCounter(typeof value === 'number' ? value : 0);

  const colorConfig = {
    primary: {
      bg:     'from-primary-700 to-primary-900',
      light:  'bg-primary-50 dark:bg-primary-900/20',
      icon:   'text-primary-600 dark:text-primary-400',
      badge:  'bg-primary-100 dark:bg-primary-900/30',
    },
    accent: {
      bg:     'from-accent to-orange-700',
      light:  'bg-orange-50 dark:bg-orange-900/20',
      icon:   'text-accent dark:text-orange-400',
      badge:  'bg-orange-100 dark:bg-orange-900/30',
    },
    success: {
      bg:     'from-success to-emerald-700',
      light:  'bg-emerald-50 dark:bg-emerald-900/20',
      icon:   'text-success dark:text-emerald-400',
      badge:  'bg-emerald-100 dark:bg-emerald-900/30',
    },
    warning: {
      bg:     'from-warning to-amber-600',
      light:  'bg-amber-50 dark:bg-amber-900/20',
      icon:   'text-warning dark:text-amber-400',
      badge:  'bg-amber-100 dark:bg-amber-900/30',
    },
    danger: {
      bg:     'from-danger to-red-700',
      light:  'bg-red-50 dark:bg-red-900/20',
      icon:   'text-danger dark:text-red-400',
      badge:  'bg-red-100 dark:bg-red-900/30',
    },
    purple: {
      bg:     'from-purple-600 to-purple-900',
      light:  'bg-purple-50 dark:bg-purple-900/20',
      icon:   'text-purple-600 dark:text-purple-400',
      badge:  'bg-purple-100 dark:bg-purple-900/30',
    },
  };

  const cfg = colorConfig[color] || colorConfig.primary;

  const trendIcon =
    trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor =
    trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-slate-400';

  const displayValue =
    typeof value === 'number' && format
      ? `${prefix}${formatNumber(animated)}${suffix}`
      : `${prefix}${value}${suffix}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, type: 'spring', stiffness: 260, damping: 24 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={clsx(
        'relative overflow-hidden rounded-2xl border border-light-border dark:border-dark-border',
        'bg-white dark:bg-dark-card shadow-card hover:shadow-card-md',
        'p-5 transition-all duration-300',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Decorative gradient blob */}
      <div
        className={clsx(
          'absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br',
          cfg.bg
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 truncate">
            {title}
          </p>
          <motion.p
            key={animated}
            className="stat-number text-slate-800 dark:text-slate-100"
          >
            {displayValue}
          </motion.p>

          {trend !== undefined && (
            <div className={clsx('flex items-center gap-1 mt-2 text-xs', trendColor)}>
              {(() => { const T = trendIcon; return <T className="w-3.5 h-3.5" />; })()}
              <span className="font-medium">
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && (
                <span className="text-slate-400 dark:text-slate-500">{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={clsx('p-3 rounded-xl flex-shrink-0 ml-3', cfg.light)}>
            <Icon className={clsx('w-6 h-6', cfg.icon)} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
