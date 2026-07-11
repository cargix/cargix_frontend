import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

import Layout from '@/components/layout/Layout';
import { PageLoader } from '@/components/common/Loader';
import PageTransition from '@/components/layout/PageTransition';

// ─── Auth Pages ───────────────────────────────────────────────────────────────
const Login          = lazy(() => import('@/pages/auth/Login'));
const Register       = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('@/pages/auth/ResetPassword'));

// ─── Admin Pages ──────────────────────────────────────────────────────────────
const AdminDashboard  = lazy(() => import('@/pages/admin/AdminDashboard'));
const Requests        = lazy(() => import('@/pages/admin/Requests'));
const AdminCompanies  = lazy(() => import('@/pages/admin/AdminCompanies'));
const AdminDrivers    = lazy(() => import('@/pages/admin/AdminDrivers'));
const AdminOrders     = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminComplaints = lazy(() => import('@/pages/admin/AdminComplaints'));
const Analytics       = lazy(() => import('@/pages/admin/Analytics'));

// ─── Company Pages ────────────────────────────────────────────────────────────
const CompanyDashboard = lazy(() => import('@/pages/company/CompanyDashboard'));
const CompanyProfile   = lazy(() => import('@/pages/company/CompanyProfile'));
const Vehicles         = lazy(() => import('@/pages/company/Vehicles'));
const Drivers          = lazy(() => import('@/pages/company/Drivers'));
const Materials        = lazy(() => import('@/pages/company/Materials'));
const Orders           = lazy(() => import('@/pages/company/Orders'));
const Complaints       = lazy(() => import('@/pages/company/Complaints'));

// ─── Protected Route ─────────────────────────────────────────────────────────
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/company'} replace />;
  }
  return children;
};

// ─── Role-based root redirect ─────────────────────────────────────────────────
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/company'} replace />;
};

// ─── Animated Routes ─────────────────────────────────────────────────────────
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Root */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth */}
        <Route path="/login"    element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="requests"   element={<PageTransition><Requests /></PageTransition>} />          <Route path="companies"  element={<PageTransition><AdminCompanies /></PageTransition>} />
          <Route path="drivers"    element={<PageTransition><AdminDrivers /></PageTransition>} />          <Route path="orders"     element={<PageTransition><AdminOrders /></PageTransition>} />
          <Route path="complaints" element={<PageTransition><AdminComplaints /></PageTransition>} />
          <Route path="analytics"  element={<PageTransition><Analytics /></PageTransition>} />
        </Route>

        {/* Company */}
        <Route path="/company" element={
          <ProtectedRoute allowedRoles={['company']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<PageTransition><CompanyDashboard /></PageTransition>} />
          <Route path="profile"    element={<PageTransition><CompanyProfile /></PageTransition>} />
          <Route path="vehicles"   element={<PageTransition><Vehicles /></PageTransition>} />
          <Route path="drivers"    element={<PageTransition><Drivers /></PageTransition>} />
          <Route path="materials"  element={<PageTransition><Materials /></PageTransition>} />
          <Route path="orders"     element={<PageTransition><Orders /></PageTransition>} />
          <Route path="complaints" element={<PageTransition><Complaints /></PageTransition>} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// ─── App Root ─────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
