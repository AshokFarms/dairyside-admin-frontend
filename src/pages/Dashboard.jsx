import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import PageHeader from '../components/common/PageHeader'
import StatsCard from '../components/common/StatsCard'
import StatusBadge from '../components/common/StatusBadge'
import { formatCurrency, formatDate, timeAgo, formatNumber } from '../utils/formatters'

// ── Mock Data (will be replaced by API calls) ──
const mockStats = {
  todayRevenue: 24580,
  weekRevenue: 156420,
  monthRevenue: 682500,
  pendingOrders: 23,
  processedOrders: 156,
  deliveredToday: 89,
  cancelledOrders: 4,
  activeSubscriptions: 342,
  pausedSubscriptions: 28,
  newSubscriptions: 12,
  trialConversions: 67,
  morningDeliveries: 64,
  eveningDeliveries: 38,
  deliveryCompletion: 87,
  lowStockProducts: 5,
  totalCustomers: 1280,
  newCustomersToday: 8,
}

const mockRevenueChart = [
  { date: 'Mon', revenue: 32400, orders: 45 },
  { date: 'Tue', revenue: 28600, orders: 38 },
  { date: 'Wed', revenue: 35200, orders: 52 },
  { date: 'Thu', revenue: 41800, orders: 58 },
  { date: 'Fri', revenue: 38900, orders: 49 },
  { date: 'Sat', revenue: 45600, orders: 62 },
  { date: 'Sun', revenue: 24580, orders: 34 },
]

const mockRecentOrders = [
  { id: 1, order_number: 'SWD260411-0042', customer: 'Rajesh Kumar', items: 3, total: 285, status: 'pending', type: 'one_time', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 2, order_number: 'SWD260411-0041', customer: 'Priya Sharma', items: 1, total: 56, status: 'out_for_delivery', type: 'subscription_delivery', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, order_number: 'SWD260411-0040', customer: 'Amit Singh', items: 2, total: 142, status: 'delivered', type: 'one_time', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 4, order_number: 'SWD260411-0039', customer: 'Sunita Devi', items: 1, total: 48, status: 'processing', type: 'subscription_delivery', created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: 5, order_number: 'SWD260411-0038', customer: 'Vikram Patel', items: 4, total: 420, status: 'confirmed', type: 'one_time', created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 6, order_number: 'SWD260411-0037', customer: 'Neha Gupta', items: 1, total: 34, status: 'delivered', type: 'trial', created_at: new Date(Date.now() - 18000000).toISOString() },
  { id: 7, order_number: 'SWD260411-0036', customer: 'Rohit Agarwal', items: 2, total: 186, status: 'cancelled', type: 'one_time', created_at: new Date(Date.now() - 21600000).toISOString() },
]

const mockLowStock = [
  { id: 1, name: 'A2 Cow Milk', variant: '500ml', stock: 12, threshold: 20 },
  { id: 2, name: 'Buffalo Milk', variant: '1L', stock: 8, threshold: 25 },
  { id: 3, name: 'Paneer (Fresh)', variant: '200g', stock: 5, threshold: 15 },
  { id: 4, name: 'Dahi (Curd)', variant: '400g', stock: 3, threshold: 20 },
  { id: 5, name: 'Ghee (Desi)', variant: '500ml', stock: 6, threshold: 10 },
]

// ── Custom Tooltip ──
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '0.75rem', color: p.color, fontWeight: 500, margin: '2px 0' }}>
          {p.name}: {p.name === 'revenue' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const stats = mockStats

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back! Here's what's happening today · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      {/* ── KPI Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <StatsCard
          title="Today's Revenue"
          value={formatCurrency(stats.todayRevenue)}
          change={12.5}
          changeType="increase"
          subtitle="vs yesterday"
          color="var(--color-success)"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          change={8.3}
          changeType="decrease"
          subtitle="vs yesterday"
          color="var(--color-warning)"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>}
        />
        <StatsCard
          title="Active Subscriptions"
          value={formatNumber(stats.activeSubscriptions)}
          change={3.2}
          changeType="increase"
          subtitle={`+${stats.newSubscriptions} new today`}
          color="var(--color-primary)"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9"/></svg>}
        />
        <StatsCard
          title="Delivered Today"
          value={stats.deliveredToday}
          change={stats.deliveryCompletion}
          changeType="increase"
          subtitle="completion rate"
          color="#10b981"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
        />
      </div>

      {/* ── Charts + Delivery Summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', marginBottom: '24px' }}>
        {/* Revenue Chart */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          padding: '20px 24px',
        }} className="animate-fadeIn">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Revenue Overview</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Last 7 days performance</p>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatCurrency(stats.weekRevenue)}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={mockRevenueChart}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#revenueGradient)" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Delivery & Subscription Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Today's Deliveries */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)',
            padding: '20px',
            flex: 1,
          }} className="animate-fadeIn">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Today's Deliveries</h3>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                flex: 1, background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)',
                padding: '14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Morning</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>{stats.morningDeliveries}</div>
              </div>
              <div style={{
                flex: 1, background: 'rgba(139, 92, 246, 0.08)', borderRadius: 'var(--radius-md)',
                padding: '14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Evening</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa' }}>{stats.eveningDeliveries}</div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', height: '8px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${stats.deliveryCompletion}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--color-primary), #8b5cf6)',
                borderRadius: 'var(--radius-sm)',
                transition: 'width 1s ease',
              }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '6px', textAlign: 'right' }}>
              {stats.deliveryCompletion}% completed
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)',
            padding: '20px',
          }} className="animate-fadeIn">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>Quick Stats</h3>
            {[
              { label: 'Total Customers', value: formatNumber(stats.totalCustomers), color: 'var(--color-info)' },
              { label: 'New Today', value: `+${stats.newCustomersToday}`, color: 'var(--color-success)' },
              { label: 'Trial Conversions', value: `${stats.trialConversions}%`, color: '#8b5cf6' },
              { label: 'Paused Subs', value: stats.pausedSubscriptions, color: 'var(--color-warning)' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border-default)' : 'none',
              }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Orders + Low Stock ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px' }}>
        {/* Recent Orders */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          overflow: 'hidden',
        }} className="animate-fadeIn">
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '18px 20px', borderBottom: '1px solid var(--border-default)',
          }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recent Orders</h3>
            <button
              onClick={() => navigate('/orders')}
              style={{
                background: 'none', border: 'none', color: 'var(--color-primary-light)',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(99, 102, 241, 0.1)'}
              onMouseLeave={e => e.target.style.background = 'none'}
            >
              View All →
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {mockRecentOrders.map((order) => (
                  <tr key={order.id} onClick={() => navigate(`/orders/${order.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>{order.order_number}</td>
                    <td style={{ fontWeight: 500 }}>{order.customer}</td>
                    <td>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 500, padding: '2px 8px',
                        borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                      }}>
                        {order.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{timeAgo(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          overflow: 'hidden',
        }} className="animate-fadeIn">
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '18px 20px', borderBottom: '1px solid var(--border-default)',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)',
              animation: 'pulse 2s infinite',
            }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Low Stock Alerts</h3>
            <span style={{
              marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px',
              borderRadius: '12px', background: 'var(--color-danger-light)', color: 'var(--color-danger)',
            }}>
              {mockLowStock.length} items
            </span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {mockLowStock.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 20px', transition: 'background var(--transition-fast)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.variant}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '0.875rem', fontWeight: 700,
                    color: item.stock <= 5 ? 'var(--color-danger)' : 'var(--color-warning)',
                  }}>
                    {item.stock} left
                  </div>
                  <div style={{
                    fontSize: '0.6875rem', color: 'var(--text-tertiary)',
                  }}>
                    min: {item.threshold}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
