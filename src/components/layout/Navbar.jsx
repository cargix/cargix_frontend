import { motion } from 'framer-motion';
import { Sun, Moon, Bell, Search, LogOut, Menu } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { initials, capitalize } from '@/utils/helpers';

// Build breadcrumb label from path
const useBreadcrumb = () => {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((p) => capitalize(p)).join(' / ');
};

const Navbar = ({ onMenuToggle }) => {
  const { isDark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const breadcrumb = useBreadcrumb();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 flex items-center justify-between px-5
                 bg-white/90 dark:bg-dark-card/90
                 backdrop-blur-md
                 border-b border-light-border dark:border-dark-border
                 sticky top-0 z-30 shadow-card"
    >
      {/* Left — Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-card2 
                     transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">
            {breadcrumb || 'Dashboard'}
          </p>
          <p className="text-xs text-slate-400 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1.5">
        {/* Dark Mode Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400
                     hover:bg-slate-100 dark:hover:bg-dark-card2 transition-all"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </motion.div>
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400
                     hover:bg-slate-100 dark:hover:bg-dark-card2 transition-all"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
        </motion.button>

        {/* Divider */}
        <div className="h-7 w-px bg-light-border dark:bg-dark-border mx-1" />

        {/* User */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent
                          flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {initials(user?.name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none">
              {user?.name}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 capitalize">
              {user?.role === 'admin' ? 'Super Admin' : user?.company?.companyName || 'Company'}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="ml-1 p-2 rounded-xl text-slate-400 hover:text-danger
                       hover:bg-danger/10 dark:hover:bg-danger/20 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
