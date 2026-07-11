import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

const sizes = {
  sm:   'max-w-md',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-full mx-4',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeable = true,
  className,
}) => {
  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape' && closeable) onClose(); },
    [closeable, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closeable ? onClose : undefined}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={clsx(
                'relative w-full bg-white dark:bg-dark-card rounded-2xl shadow-card-lg',
                'border border-light-border dark:border-dark-border',
                'flex flex-col max-h-[90vh]',
                sizes[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || closeable) && (
                <div className="flex items-start justify-between p-5 border-b border-light-border dark:border-dark-border flex-shrink-0">
                  <div>
                    {title && (
                      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
                    )}
                  </div>
                  {closeable && (
                    <button
                      onClick={onClose}
                      className="ml-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100
                                 dark:hover:text-slate-300 dark:hover:bg-dark-card2 transition-all flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="flex items-center justify-end gap-3 p-5 border-t border-light-border dark:border-dark-border flex-shrink-0">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
