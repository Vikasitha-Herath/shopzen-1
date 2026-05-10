import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import API from '../../utils/api';

const StatCard = ({ label, value, sub, icon, color, trend }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="font-display text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <span className="text-xl">{icon}</span>
      </div>
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        <span>{trend >= 0 ? '↑' : '↓'}</span>
        <span>{Math.abs(trend)}% vs last month</span>
      </div>
    )}
  </div>
);

const COLORS = ['#b5451b', '#f0a500', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];
const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-28 shimmer" />)}
      </div>
    </div>
  );

  const { stats, revenueChart, topProducts, ordersByStatus, recentOrders } = data;
  const revTrend = stats.lastMonthRevenue > 0 ? Math.round(((stats.monthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`Rs. ${(stats.totalRevenue || 0).toLocaleString()}`} sub="All time" icon="💰" color="bg-amber-50" trend={revTrend} />
        <StatCard label="This Month" value={`Rs. ${(stats.monthRevenue || 0).toLocaleString()}`} sub={`Last: Rs. ${(stats.lastMonthRevenue || 0).toLocaleString()}`} icon="📈" color="bg-green-50" />
        <StatCard label="Total Orders" value={stats.totalOrders} sub={`${stats.todayOrders} today`} icon="📦" color="bg-blue-50" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} sub="Needs attention" icon="⏳" color="bg-orange-50" />
        <StatCard label="Total Products" value={stats.totalProducts} sub={stats.lowStockProducts > 0 ? `⚠️ ${stats.lowStockProducts} low stock` : 'All in stock'} icon="🛍️" color="bg-purple-50" />
        <StatCard label="Customers" value={stats.totalCustomers} sub={`+${stats.newCustomersMonth} this month`} icon="👥" color="bg-pink-50" />
        <StatCard label="Unread Orders" value={stats.unreadOrders} sub="New notifications" icon="🔔" color="bg-red-50" />
        <StatCard label="Low Stock" value={stats.lowStockProducts} sub="Items to restock" icon="📉" color="bg-yellow-50" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue — Last 30 Days</h2>
          {revenueChart?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueChart} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                  tickFormatter={v => v ? v.slice(5) : ''} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                  tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="revenue" fill="#b5451b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Orders by Status</h2>
          {ordersByStatus?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="count" nameKey="_id" paddingAngle={2}>
                    {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, STATUS_LABELS[n] || n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {ordersByStatus.map((s, i) => (
                  <div key={s._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 capitalize">{STATUS_LABELS[s._id] || s._id}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No orders yet</div>}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {recentOrders?.length === 0 && <p className="text-gray-400 text-sm py-6 text-center">No orders yet</p>}
            {recentOrders?.map(order => (
              <Link key={order._id} to={`/admin/orders/${order._id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div>
                  <p className="text-sm font-semibold text-gray-800 font-mono">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.billing?.firstName} {order.billing?.lastName} · {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">Rs. {order.total?.toLocaleString()}</p>
                  <span className={`badge ${`status-${order.orderStatus}`} capitalize text-xs`}>{order.orderStatus?.replace(/_/g,' ')}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Top Products</h2>
            <Link to="/admin/products" className="text-xs text-primary hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {topProducts?.length === 0 && <p className="text-gray-400 text-sm py-6 text-center">No products yet</p>}
            {topProducts?.map((product, i) => (
              <div key={product._id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5 flex-shrink-0">{i + 1}</span>
                <img src={product.thumbnail || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.soldCount} sold</p>
                </div>
                <p className="text-sm font-bold text-gray-700">Rs. {product.price?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
