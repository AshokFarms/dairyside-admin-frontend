import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import { formatCurrency, formatDate, timeAgo } from '../../utils/formatters'
import { ORDER_STATUS_LABELS } from '../../utils/constants'

const mockOrders = Array.from({ length: 25 }, (_, i) => {
  const statuses = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled']
  const types = ['one_time', 'subscription_delivery', 'trial']
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Devi', 'Vikram Patel', 'Neha Gupta', 'Rohit Agarwal', 'Kavita Rao', 'Deepak Joshi', 'Anita Verma']
  return {
    id: i + 1,
    order_number: `SWD2604${String(11 - Math.floor(i / 10)).padStart(2, '0')}-${String(50 - i).padStart(4, '0')}`,
    customer_name: names[i % names.length],
    customer_phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
    items_count: Math.floor(Math.random() * 5) + 1,
    total_amount: Math.floor(Math.random() * 800) + 40,
    status: statuses[i % statuses.length],
    order_type: types[i % types.length],
    payment_status: i % 4 === 0 ? 'pending' : 'paid',
    delivery_shift: i % 2 === 0 ? 'morning' : 'evening',
    delivery_date: new Date(Date.now() + (i % 3 - 1) * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
  }
})

export default function OrderList() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredOrders = mockOrders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (typeFilter !== 'all' && o.order_type !== typeFilter) return false
    return true
  })

  const columns = [
    {
      key: 'order_number',
      header: 'Order #',
      minWidth: '140px',
      render: (val) => (
        <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.customer_phone}</div>
        </div>
      ),
    },
    {
      key: 'order_type',
      header: 'Type',
      render: (val) => (
        <span style={{
          fontSize: '0.7rem', fontWeight: 500, padding: '2px 8px',
          borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
          textTransform: 'capitalize',
        }}>
          {val.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'items_count',
      header: 'Items',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'total_amount',
      header: 'Amount',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600 }}>{formatCurrency(val)}</span>,
    },
    {
      key: 'delivery_shift',
      header: 'Shift',
      render: (val) => (
        <span style={{
          fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
          background: val === 'morning' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(139, 92, 246, 0.1)',
          color: val === 'morning' ? '#fbbf24' : '#a78bfa',
          textTransform: 'capitalize',
        }}>
          ☀ {val}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (val) => <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{timeAgo(val)}</span>,
    },
  ]

  const statusTabs = ['all', 'pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled']

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${mockOrders.length} total orders`}>
        <Button variant="secondary" size="sm" icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        }>
          Export
        </Button>
      </PageHeader>

      {/* Status Tabs */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap',
        background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '4px',
        border: '1px solid var(--border-default)', width: 'fit-content',
      }}>
        {statusTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
              fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              background: statusFilter === tab ? 'var(--color-primary)' : 'transparent',
              color: statusFilter === tab ? 'white' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'all' ? 'All' : (ORDER_STATUS_LABELS[tab] || tab.replace(/_/g, ' '))}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        onRowClick={(row) => navigate(`/orders/${row.id}`)}
        pagination={{ total: filteredOrders.length, limit: 25, offset: 0 }}
        emptyTitle="No orders found"
        emptyDescription="Try changing the status filter"
      />
    </div>
  )
}
