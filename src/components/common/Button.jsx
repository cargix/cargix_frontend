import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const variants = {
  primary:  'btn-primary',
  accent:   'btn-accent',
  outline:  'btn-outline',
  ghost:    'btn-ghost',
  danger:   'btn-danger',
  success:  'btn-success',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg',
  sm: 'px-3 py-2 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  onClick,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      whileTap={!isDisabled ? { scale: 0.96 } : {}}
      whileHover={!isDisabled ? { scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={clsx(
        variants[variant] || variants.primary,
        sizes[size],
        fullWidth && 'w-full',
        'relative overflow-hidden',
        className
      )}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin absolute left-1/2 -translate-x-1/2" />
      )}
      <span className={clsx('flex items-center gap-2', loading && 'opacity-0')}>
        {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
        {children}
        {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
      </span>
    </motion.button>
  );
};

export default Button;
