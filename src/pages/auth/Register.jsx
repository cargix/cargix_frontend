import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, Phone, Truck, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    companyName: '', contactPhone: '', address: '', serviceArea: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const validateStep1 = () => {
    const e = {};
    if (!form.name) e.name = 'Full name required';
    if (!form.email) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.companyName) e.companyName = 'Company name required';
    if (!form.contactPhone) e.contactPhone = 'Phone number required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const nextStep = () => { if (validateStep1()) { setErrors({}); setStep(2); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setGlobalError('');

    const result = await register(form);
    if (result.success) {
      setSuccess(true);
    } else {
      setGlobalError(result.message);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-8 max-w-md w-full text-center shadow-card-lg border border-light-border dark:border-dark-border"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle className="w-8 h-8 text-success" />
          </motion.div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Registration Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Your company registration is under review. You&apos;ll be notified once approved by the admin.
          </p>
          <Button variant="outline" onClick={() => navigate('/login')} fullWidth>
            Back to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-light-bg dark:bg-dark-bg">
      {/* Left branding */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700
                   flex-col items-center justify-center relative overflow-hidden p-12"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6">
          <Truck className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-white text-center mb-4">
          Join the Cargix<br />
          <span className="text-accent">Ecosystem</span>
        </h1>
        <p className="text-primary-200 text-center text-base max-w-xs">
          Register your transport company and start managing logistics at scale.
        </p>

        {/* Steps indicator */}
        <div className="mt-10 space-y-3 w-full max-w-xs">
          {['Account Details', 'Company Profile', 'Admin Review', 'Start Operating'].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${i < step ? 'bg-success text-white' : i === step - 1 ? 'bg-accent text-white' : 'bg-white/20 text-white/50'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${i === step - 1 ? 'text-white font-semibold' : 'text-primary-300'}`}>{s}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-primary-800 dark:text-white">Cargix</span>
          </div>

          {/* Step header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                Step {step} of 2
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {step === 1 ? 'Create your account' : 'Company details'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {step === 1
                ? 'Set up your login credentials'
                : 'Tell us about your transport company'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100 dark:bg-dark-card2 rounded-full mb-6 overflow-hidden">
            <motion.div
              animate={{ width: step === 1 ? '50%' : '100%' }}
              className="h-full bg-gradient-to-r from-primary-700 to-accent rounded-full"
              transition={{ duration: 0.4 }}
            />
          </div>

          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-danger/10 border border-danger/30 rounded-xl flex items-center gap-2 text-danger text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {globalError}
            </motion.div>
          )}

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); nextStep(); } : handleSubmit}>
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Input label="Full name" icon={User} placeholder="John Doe" value={form.name} onChange={set('name')} error={errors.name} required />
                <Input label="Email address" type="email" icon={Mail} placeholder="you@company.com" value={form.email} onChange={set('email')} error={errors.email} required />
                <Input label="Password" type="password" icon={Lock} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} error={errors.password} required />
                <Input label="Confirm password" type="password" icon={Lock} placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} required />
                <Button type="submit" fullWidth size="lg" icon={ArrowRight} iconPosition="right" className="mt-2">
                  Continue
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Input label="Company name" icon={Building2} placeholder="Rapid Freight Ltd." value={form.companyName} onChange={set('companyName')} error={errors.companyName} required />
                <Input label="Contact phone" icon={Phone} placeholder="+1 555 000 1234" value={form.contactPhone} onChange={set('contactPhone')} error={errors.contactPhone} required />
                <Input label="Business address" placeholder="123 Logistics Ave, City" value={form.address} onChange={set('address')} />
                <Input label="Service areas" placeholder="New York, Los Angeles, Chicago" value={form.serviceArea} onChange={set('serviceArea')} hint="Comma-separated list of cities or regions" />
                <div className="flex gap-3 mt-2">
                  <Button type="button" variant="outline" fullWidth onClick={() => { setErrors({}); setStep(1); }}>
                    Back
                  </Button>
                  <Button type="submit" fullWidth loading={loading} icon={ArrowRight} iconPosition="right">
                    Submit
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-700 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
