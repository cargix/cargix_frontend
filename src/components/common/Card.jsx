import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const Card = ({
  children,
  className,
  hover = false,
  glass = false,
  padding = true,
  onClick,
  animate = true,
  delay = 0,
}) => {
  const baseClass = clsx(
    'rounded-2xl border transition-all duration-300',
    glass
      ? 'glass-card'
      : 'bg-white dark:bg-dark-card border-light-border dark:border-dark-border shadow-card',
    hover && 'hover:shadow-card-lg hover:-translate-y-0.5 cursor-pointer',
    padding && 'p-5',
    className
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className={baseClass}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClass} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, icon: Icon, iconColor = 'text-primary-600' }) => (
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20">
          <Icon className={clsx('w-5 h-5', iconColor)} />
        </div>
      )}
      <div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

import { clsx as cx } from 'clsx';
export const CardSection = ({ children, className }) => (
  <div className={cx('border-t border-light-border dark:border-dark-border pt-4 mt-4', className)}>
    {children}
  </div>
);

export default Card;
