import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import { formatCurrency, formatDate } from '../../utils/formatters'

const mockSubscriptions = Array.from({ length: 15 }, (_, i) => {
  const statuses = ['active', 'active', 'active', 'paused', 'cancelled']
  const freqs = ['Daily', 'Alternate Days', 'Custom', 'Daily', 'Weekly']
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Devi', 'Vikram Patel']
  const products = ['A2 Cow Milk', 'Buffalo Milk', 'Toned Milk', 'Paneer (Fresh)', 'Dahi (Curd)']
  return {
    id: i + 1,
    customer_name: names[i % names.length],
    product_name: products[i % products.length],
    variant_label: ['500ml', '1L', '200g', '400g', '500ml'][i % 5],
    frequency: freqs[i % freqs.length],
    quantity: Math.floor(Math.random() * 3) + 1,
    delivery_shift: i % 2 === 0 ? 'morning' : 'evening',
    status: statuses[i % statuses.length],
    total_deliveries: Math.floor(Math.random() * 100) + 10,
    start_date: new Date(Date.now() - (i * 30 + 10) * 86400000).toISOString(),
    next_delivery: new Date(Date.now() + Math.random() * 3 * 86400000).toISOString(),
  }
})

export default function SubscriptionList() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = mockSubscriptions.filter(s => statusFilter === 'all' || s.status === statusFilter)

  const columns = [
    { key: 'id', header: 'ID', width: '60px', render: (val) => <span style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>#{val}</span> },
    {
      key: 'customer_name', header: 'Customer',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'product_name', header: 'Product',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.variant_label} × {row.quantity}</div>
        </div>
      ),
    },
    {
      key: 'frequency', header: 'Frequency',
      render: (val) => (
        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--color-primary-light)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'delivery_shift', header: 'Shift',
      render: (val) => <span style={{ textTransform: 'capitalize' }}>{val === 'morning' ? '☀' : '🌙'} {val}</span>,
    },
    { key: 'total_deliveries', header: 'Deliveries', align: 'center', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { key: 'start_date', header: 'Started', render: (val) => <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{formatDate(val)}</span> },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
  ]

  return (
    <div>
      <PageHeader title="Subscriptions" subtitle={`${mockSubscriptions.length} total subscriptions`} />
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--border-default)', width: 'fit-content' }}>
        {['all', 'active', 'paused', 'cancelled'].map(tab => (
          <button key={tab} onClick={() => setStatusFilter(tab)}
            style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: statusFilter === tab ? 'var(--color-primary)' : 'transparent', color: statusFilter === tab ? 'white' : 'var(--text-secondary)', transition: 'all var(--transition-fast)', textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>
      <DataTable columns={columns} data={filtered} onRowClick={(r) => navigate(`/subscriptions/${r.id}`)} pagination={{ total: filtered.length, limit: 20, offset: 0 }} emptyTitle="No subscriptions found" />
    </div>
  )
}
