import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Users, Package, ClipboardList, DollarSign, TrendingUp, Activity, CheckCircle } from 'lucide-react';
import api from '@/api/axios';
import StatCard from '@/components/common/StatCard';
import Card, { CardHeader } from '@/components/common/Card';
import { OrderBadge } from '@/components/common/Badge';
import { StatsSkeleton } from '@/components/common/Loader';
import { formatCurrency, timeAgo } from '@/utils/helpers';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const CompanyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/company/stats')
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { title: 'Total Vehicles',   value: stats.totalVehicles,    icon: Truck,         color: 'primary', delay: 0    },
        { title: 'Active Drivers',   value: stats.totalDrivers,     icon: Users,         color: 'accent',  delay: 0.06 },
        { title: 'Total Orders',     value: stats.totalOrders,      icon: ClipboardList, color: 'purple',  delay: 0.12 },
        { title: 'Pending Orders',   value: stats.pendingOrders,    icon: Package,       color: 'warning', delay: 0.18 },
        { title: 'Completed Orders', value: stats.completedOrders,  icon: CheckCircle,   color: 'success', delay: 0.24 },
        { title: 'Total Earnings',   value: stats.totalRevenue,     icon: DollarSign,    color: 'primary', delay: 0.30, prefix: '$' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Company Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {stats?.company?.companyName || 'Your company overview'}
        </p>
      </div>

      {loading ? (
        <StatsSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((s) => <StatCard key={s.title} {...s} />)}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Orders This Week" icon={Activity} />
          {loading ? <div className="h-48 shimmer-bg rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={stats?.ordersPerDay || []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cgOrd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#F97316" strokeWidth={2.5} fill="url(#cgOrd)" name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Order status breakdown */}
        <Card>
          <CardHeader title="Order Breakdown" subtitle="Current period" icon={TrendingUp} />
          {loading ? <div className="h-48 shimmer-bg rounded-xl" /> : (
            <div className="space-y-3 mt-2">
              {[
                { label: 'Pending',    value: stats?.pendingOrders,   color: 'bg-warning',  total: stats?.totalOrders },
                { label: 'Accepted',   value: stats?.acceptedOrders,  color: 'bg-primary-700', total: stats?.totalOrders },
                { label: 'In Transit', value: stats?.inTransitOrders, color: 'bg-accent',   total: stats?.totalOrders },
                { label: 'Delivered',  value: stats?.completedOrders, color: 'bg-success',  total: stats?.totalOrders },
                { label: 'Cancelled',  value: stats?.cancelledOrders, color: 'bg-danger',   total: stats?.totalOrders },
              ].map(({ label, value, color, total }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{label}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{value} <span className="text-slate-400">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-dark-card2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={`h-full ${color} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Recent orders table */}
      <Card>
        <CardHeader title="Recent Orders" icon={ClipboardList} />
        {loading ? <div className="h-48 shimmer-bg rounded-xl" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-head">
                  <th className="px-3 py-2.5 text-left">Order #</th>
                  <th className="px-3 py-2.5 text-left">Customer</th>
                  <th className="px-3 py-2.5 text-left">Material</th>
                  <th className="px-3 py-2.5 text-left">Driver</th>
                  <th className="px-3 py-2.5 text-left">Status</th>
                  <th className="px-3 py-2.5 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {(stats?.recentOrders || []).map((o) => (
                  <tr key={o._id} className="table-row">
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-primary-700 dark:text-primary-300">{o.orderNumber}</td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{o.customerName}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-400">{o.materialId?.name || '—'}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-400">{o.assignedDriver?.name || <span className="text-slate-400 text-xs">Unassigned</span>}</td>
                    <td className="px-3 py-3"><OrderBadge status={o.status} /></td>
                    <td className="px-3 py-3 text-slate-400 text-xs">{timeAgo(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CompanyDashboard;
