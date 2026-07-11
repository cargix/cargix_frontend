import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Truck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});

    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(result.user.role === 'admin' ? '/admin' : '/company');
    } else {
      setErrors({ global: result.message });
    }
  };

  return (
    <div className="min-h-screen flex bg-light-bg dark:bg-dark-bg">
      {/* ── Left Panel ── */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700
                   flex-col items-center justify-center relative overflow-hidden p-12"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-glass">
            <Truck className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <h1 className="text-4xl font-extrabold text-white text-center mb-4 leading-tight">
          Move Cargo.<br />
          <span className="text-accent">Move Forward.</span>
        </h1>
        <p className="text-primary-200 text-center text-base max-w-xs leading-relaxed">
          Cargix connects logistics companies, drivers, and customers on a single powerful platform.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mt-8 justify-center">
          {['Real-time Tracking', 'Smart Routing', 'Fleet Management', 'Analytics'].map((f) => (
            <span key={f} className="px-3 py-1.5 bg-white/10 rounded-full text-xs text-white font-medium">
              {f}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-primary-800 dark:text-white">Cargix</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
            Welcome back
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-7">
            Sign in to your account to continue
          </p>

          {/* Global error */}
          {errors.global && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-danger/10 border border-danger/30 rounded-xl
                         flex items-center gap-2 text-danger text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.global}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              error={errors.password}
              required
            />

            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-700 dark:text-primary-400 font-semibold hover:underline">
              Register your company
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800/30">
            <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 mb-1.5">
              Demo Credentials
            </p>
            <p className="text-xs text-primary-600 dark:text-primary-400">
              Admin: <span className="font-mono">admin@cargix.io</span> / <span className="font-mono">Admin@1234</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
