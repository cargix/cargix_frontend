import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Package, AlertCircle, BarChart3,
  Building2, Truck, Users, Box, ClipboardList, UserCircle,
  ChevronLeft, ChevronRight, LogOut, Truck as TruckIcon, MessageSquare,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { initials } from '@/utils/helpers';

const adminNav = [
  { path: '/admin',             icon: LayoutDashboard, label: 'Dashboard',       exact: true },
  { path: '/admin/requests',    icon: FileText,        label: 'Requests'                     },
  { path: '/admin/companies',   icon: Building2,       label: 'Companies'                    },
  { path: '/admin/drivers',     icon: Users,           label: 'Drivers'                      },
  { path: '/admin/orders',      icon: Package,         label: 'Orders'                       },
  { path: '/admin/complaints',  icon: AlertCircle,     label: 'Complaints'                   },
  { path: '/admin/analytics',   icon: BarChart3,       label: 'Analytics'                    },
];

const companyNav = [
  { path: '/company',           icon: LayoutDashboard, label: 'Dashboard',       exact: true },
  { path: '/company/profile',   icon: Building2,       label: 'Profile'                      },
  { path: '/company/vehicles',  icon: Truck,           label: 'Vehicles'                     },
  { path: '/company/drivers',   icon: Users,           label: 'Drivers'                      },
  { path: '/company/materials', icon: Box,             label: 'Materials'                    },
  { path: '/company/orders',    icon: ClipboardList,   label: 'Orders'                       },
  { path: '/company/complaints',icon: MessageSquare,   label: 'Complaints'                   },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const nav = isAdmin ? adminNav : companyNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col
                 bg-white dark:bg-dark-card
                 border-r border-light-border dark:border-dark-border
                 shadow-card overflow-hidden"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-light-border dark:border-dark-border flex-shrink-0">
        <motion.div
          whileHover={{ rotate: 10 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700 to-primary-900
                     flex items-center justify-center flex-shrink-0 shadow-glow"
        >
          <TruckIcon className="w-5 h-5 text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="font-extrabold text-lg text-primary-800 dark:text-white leading-none">
                Cargix
              </p>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                {isAdmin ? 'Admin Panel' : 'Transport Co.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-4 px-3 space-y-0.5">
        {nav.map(({ path, icon: Icon, label, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            className={({ isActive }) =>
              clsx('sidebar-item', isActive && 'active')
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* ── User Footer ── */}
      <div className="border-t border-light-border dark:border-dark-border p-3 flex-shrink-0">
        <div className={clsx('flex items-center gap-2.5', collapsed && 'justify-center')}>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent
                          flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow">
            {initials(user?.name)}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10
                           dark:hover:bg-danger/20 transition-all flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {collapsed && (
          <button
            onClick={handleLogout}
            title="Logout"
            className="mt-2 w-full flex justify-center p-1.5 rounded-lg text-slate-400
                       hover:text-danger hover:bg-danger/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Collapse Toggle ── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="absolute -right-3.5 top-20 z-50 w-7 h-7 rounded-full
                   bg-white dark:bg-dark-card border border-light-border dark:border-dark-border
                   shadow-card flex items-center justify-center
                   text-slate-500 hover:text-primary-700 transition-colors"
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft className="w-3.5 h-3.5" />
        }
      </motion.button>
    </motion.aside>
  );
};

export default Sidebar;
