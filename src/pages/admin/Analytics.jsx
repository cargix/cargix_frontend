import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';
import api from '@/api/axios';
import Card, { CardHeader } from '@/components/common/Card';
import StatCard from '@/components/common/StatCard';
import PageTransition from '@/components/layout/PageTransition';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatCurrency } from '@/utils/helpers';

const COLORS = ['#1E3A8A', '#F97316', '#10B981', '#F59E0B', '#EF4444', '#8b5cf6'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(({ data: res }) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = data?.revenueByMonth?.reduce((s, r) => s + r.revenue, 0) || 0;
  const totalOrders  = data?.companyPerformance?.reduce((s, c) => s + c.totalOrders, 0) || 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">30-day platform performance overview</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="30-Day Revenue" value={totalRevenue} prefix="$" icon={DollarSign} color="primary" delay={0} />
          <StatCard title="30-Day Orders" value={totalOrders} icon={Package} color="accent" delay={0.06} />
          <StatCard title="Active Companies" value={data?.companyPerformance?.length || 0} icon={BarChart3} color="success" delay={0.12} />
          <StatCard title="Avg. Completion" value={
            data?.companyPerformance?.length
              ? Math.round(data.companyPerformance.reduce((s, c) => s + (c.totalOrders > 0 ? (c.completed / c.totalOrders) * 100 : 0), 0) / data.companyPerformance.length)
              : 0
          } suffix="%" icon={TrendingUp} color="success" delay={0.18} />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily orders */}
          <Card>
            <CardHeader title="Daily Orders (30 days)" icon={Package} />
            {loading ? <div className="h-60 shimmer-bg rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data?.ordersPerDay || []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aOrd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1E3A8A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#F97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="orders" stroke="#1E3A8A" strokeWidth={2} fill="url(#aOrd)" name="Orders" />
                  <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2} fill="url(#aRev)" name="Revenue ($)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Monthly revenue */}
          <Card>
            <CardHeader title="Monthly Revenue" icon={DollarSign} />
            {loading ? <div className="h-60 shimmer-bg rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data?.revenueByMonth || []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                  <Bar dataKey="revenue" fill="#1E3A8A" radius={[6, 6, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle status */}
          <Card>
            <CardHeader title="Vehicle Status" icon={BarChart3} />
            {loading ? <div className="h-48 shimmer-bg rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data?.vehicleStats || []} dataKey="count" nameKey="_id"
                    cx="50%" cy="50%" outerRadius={75} paddingAngle={4}>
                    {(data?.vehicleStats || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', fontSize: '12px' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} formatter={(v) => v?.replace('_', ' ')} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Company performance */}
          <Card className="lg:col-span-2">
            <CardHeader title="Top Company Performance" subtitle="Orders & completion rate" icon={TrendingUp} />
            {loading ? <div className="h-48 shimmer-bg rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={(data?.companyPerformance || []).slice(0, 6)} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                  <XAxis dataKey="companyName" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', fontSize: '12px' }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="totalOrders" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="Total Orders" />
                  <Bar dataKey="completed"   fill="#10B981" radius={[4, 4, 0, 0]} name="Completed"    />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default Analytics;
