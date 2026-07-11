import { motion } from 'framer-motion';
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

// ── Skeleton row ──────────────────────────────────────────────────────────────
const SkeletonRow = ({ cols }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

// ── Main Table ────────────────────────────────────────────────────────────────
const Table = ({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  emptyIcon: EmptyIcon = Inbox,
  pagination,
  onPageChange,
  rowKey = '_id',
  onRowClick,
}) => {
  const colCount = columns.length;

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-light-border dark:border-dark-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-head">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3 text-left whitespace-nowrap',
                    col.width && `w-${col.width}`
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border dark:divide-dark-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={colCount}>
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
                    <EmptyIcon className="w-10 h-10 mb-3 opacity-50" />
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <motion.tr
                  key={row[rowKey] || idx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={clsx('table-row', onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        'px-4 py-3 text-slate-700 dark:text-slate-300',
                        col.className
                      )}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing{' '}
            <span className="font-semibold">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold">{pagination.total}</span> results
          </p>
          <div className="flex items-center gap-1">
            <PaginationBtn
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              icon={ChevronLeft}
            />
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={clsx(
                    'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                    page === pagination.page
                      ? 'bg-primary-700 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-card2'
                  )}
                >
                  {page}
                </button>
              );
            })}
            <PaginationBtn
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              icon={ChevronRight}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const PaginationBtn = ({ onClick, disabled, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-8 h-8 rounded-lg flex items-center justify-center
               text-slate-600 dark:text-slate-400
               hover:bg-slate-100 dark:hover:bg-dark-card2
               disabled:opacity-40 disabled:cursor-not-allowed transition-all"
  >
    <Icon className="w-4 h-4" />
  </button>
);

export default Table;
