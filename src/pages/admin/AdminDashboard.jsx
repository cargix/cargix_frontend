import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, Truck, Package, AlertCircle, DollarSign,
  Clock, TrendingUp, Activity,
} from 'lucide-react';
import api from '@/api/axios';
import StatCard from '@/components/common/StatCard';
import Card, { CardHeader } from '@/components/common/Card';
import { OrderBadge } from '@/components/common/Badge';
import { StatsSkeleton, TableSkeleton } from '@/components/common/Loader';
import PageTransition from '@/components/layout/PageTransition';
import { formatCurrency, formatDate, timeAgo } from '@/utils/helpers';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#1E3A8A', '#F97316', '#10B981', '#F59E0B', '#EF4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        { title: 'Total Companies',    value: stats.totalCompanies,    icon: Building2, color: 'primary' },
        { title: 'Active Drivers',      value: stats.totalDrivers,       icon: Users,    color: 'accent'  },
        { title: 'Total Vehicles',      value: stats.totalVehicles,      icon: Truck,    color: 'purple'  },
        { title: 'Total Orders',        value: stats.totalOrders,        icon: Package,  color: 'success' },
        { title: 'Pending Requests',    value: stats.pendingRequests,    icon: Clock,    color: 'warning' },
        { title: 'Open Complaints',     value: stats.openComplaints,     icon: AlertCircle, color: 'danger' },
        { title: 'Completed Orders',    value: stats.completedOrders,    icon: TrendingUp,  color: 'success' },
        { title: 'Total Revenue',       value: stats.totalRevenue,       icon: DollarSign,  color: 'primary', prefix: '$', format: true },
      ]
    : [];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Super Admin Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform overview and real-time metrics
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <StatsSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <StatCard key={s.title} {...s} delay={i * 0.06} />
            ))}
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders per day */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Orders This Week"
              subtitle="Daily order volume"
              icon={Activity}
            />
            {loading ? (
              <div className="h-56 shimmer-bg rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats?.ordersPerDay || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: '12px' }}
                    labelFormatter={(v) => `Date: ${v}`}
                  />
                  <Area type="monotone" dataKey="count" stroke="#1E3A8A" strokeWidth={2.5} fill="url(#colorOrders)" name="Orders" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Order status breakdown */}
          <Card>
            <CardHeader title="Order Status" subtitle="Distribution breakdown" icon={Package} />
            {loading ? (
              <div className="h-56 shimmer-bg rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pending',    value: stats?.pendingOrders   || 0 },
                      { name: 'Completed',  value: stats?.completedOrders || 0 },
                      { name: 'Cancelled',  value: stats?.cancelledOrders || 0 },
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {PIE_COLORS.map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader title="Recent Orders" subtitle="Latest order activity" icon={Package} />
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-head">
                    <th className="px-3 py-2.5 text-left">Order #</th>
                    <th className="px-3 py-2.5 text-left">Customer</th>
                    <th className="px-3 py-2.5 text-left">Company</th>
                    <th className="px-3 py-2.5 text-left">Material</th>
                    <th className="px-3 py-2.5 text-left">Status</th>
                    <th className="px-3 py-2.5 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {(stats?.recentOrders || []).map((o) => (
                    <motion.tr
                      key={o._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="table-row"
                    >
                      <td className="px-3 py-3 font-mono text-xs font-semibold text-primary-700 dark:text-primary-300">
                        {o.orderNumber}
                      </td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{o.customerName}</td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                        {o.companyId?.companyName || '—'}
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                        {o.materialId?.name || '—'}
                      </td>
                      <td className="px-3 py-3"><OrderBadge status={o.status} /></td>
                      <td className="px-3 py-3 text-slate-400 text-xs">{timeAgo(o.createdAt)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
