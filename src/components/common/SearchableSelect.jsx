import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * SearchableSelect — single or multi-select dropdown with search.
 *
 * Props:
 *  label        — field label
 *  options      — string[]  list of option strings
 *  value        — string (single) | string[] (multi)
 *  onChange     — (value) => void
 *  placeholder  — placeholder when nothing selected
 *  icon         — lucide icon component
 *  className    — wrapper class
 *  multi        — enable multi-select mode
 *  disabled     — disable the control
 *  hint         — helper text below the field
 */
const SearchableSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  icon: Icon,
  className,
  multi = false,
  disabled = false,
  hint,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  const isSelected = useCallback(
    (opt) => (multi ? (value || []).includes(opt) : value === opt),
    [multi, value]
  );

  const toggle = (opt) => {
    if (multi) {
      const current = value || [];
      onChange(
        current.includes(opt)
          ? current.filter((v) => v !== opt)
          : [...current, opt]
      );
    } else {
      onChange(value === opt ? '' : opt);
      setOpen(false);
      setSearch('');
    }
  };

  const removeTag = (e, opt) => {
    e.stopPropagation();
    onChange((value || []).filter((v) => v !== opt));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange(multi ? [] : '');
  };

  // Display label inside the trigger
  const triggerLabel = () => {
    if (multi) {
      const arr = value || [];
      if (arr.length === 0) return null;
      return arr;
    }
    return value || null;
  };
  const hasValue = multi ? (value || []).length > 0 : !!value;

  return (
    <div className={clsx('w-full relative', className)} ref={wrapRef}>
      {/* Field label */}
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
        className={clsx(
          'input-base w-full flex items-center gap-2 text-left cursor-pointer select-none',
          disabled && 'opacity-60 cursor-not-allowed',
          open && 'ring-2 ring-primary-500/30 border-primary-400'
        )}
      >
        {Icon && <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />}

        {/* Value display */}
        <div className="flex-1 min-w-0 flex flex-wrap gap-1">
          {multi ? (
            (value || []).length > 0 ? (
              (value || []).map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                >
                  {v}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-primary-900"
                    onClick={(e) => removeTag(e, v)}
                  />
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-sm truncate">{placeholder}</span>
            )
          ) : (
            <span className={clsx('text-sm truncate', !value && 'text-slate-400')}>
              {value || placeholder}
            </span>
          )}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-auto pl-1">
          {hasValue && (
            <X
              className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              onClick={clearAll}
            />
          )}
          <ChevronDown
            className={clsx(
              'w-4 h-4 text-slate-400 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl shadow-xl overflow-hidden">
          {/* Search bar */}
          <div className="p-2 border-b border-light-border dark:border-dark-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-slate-700 dark:text-slate-200 placeholder-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-400">
                No results for "{search}"
              </li>
            ) : (
              filtered.map((opt) => {
                const selected = isSelected(opt);
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => toggle(opt)}
                      className={clsx(
                        'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                        selected
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-hover'
                      )}
                    >
                      {multi ? (
                        <span
                          className={clsx(
                            'w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                            selected
                              ? 'bg-primary-600 border-primary-600'
                              : 'border-slate-300 dark:border-slate-600'
                          )}
                        >
                          {selected && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                      ) : (
                        <span
                          className={clsx(
                            'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                            selected
                              ? 'border-primary-600'
                              : 'border-slate-300 dark:border-slate-600'
                          )}
                        >
                          {selected && (
                            <span className="w-2 h-2 rounded-full bg-primary-600 block" />
                          )}
                        </span>
                      )}
                      <span className="truncate">{opt}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Multi-select footer */}
          {multi && (value || []).length > 0 && (
            <div className="px-3 py-2 border-t border-light-border dark:border-dark-border bg-slate-50 dark:bg-dark-bg flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {(value || []).length} selected
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-danger hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {hint && (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
};

export default SearchableSelect;
