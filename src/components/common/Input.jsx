import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      icon: Icon,
      iconRight,
      className,
      inputClassName,
      required,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={clsx('w-full', className)}>
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Icon className="w-4 h-4 text-slate-400" />
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={clsx(
              'input-base',
              Icon && 'pl-10',
              (isPassword || iconRight) && 'pr-10',
              error &&
                'border-danger/60 focus:ring-danger/30 focus:border-danger dark:border-danger/60',
              disabled && 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800',
              inputClassName
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {iconRight && !isPassword && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              {iconRight}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ── Textarea variant ──────────────────────────────────────────────────────────
export const Textarea = forwardRef(({ label, error, hint, className, required, rows = 3, ...props }, ref) => (
  <div className={clsx('w-full', className)}>
    {label && (
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      rows={rows}
      className={clsx(
        'input-base resize-none',
        error && 'border-danger/60 focus:ring-danger/30 focus:border-danger'
      )}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs text-danger flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

// ── Select variant ────────────────────────────────────────────────────────────
export const Select = forwardRef(({ label, error, hint, className, required, children, ...props }, ref) => (
  <div className={clsx('w-full', className)}>
    {label && (
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={clsx(
        'input-base cursor-pointer',
        error && 'border-danger/60 focus:ring-danger/30 focus:border-danger'
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1.5 text-xs text-danger flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
  </div>
));
Select.displayName = 'Select';

export default Input;
