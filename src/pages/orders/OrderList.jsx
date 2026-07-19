import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import { ordersApi } from '../../api'
import { formatCurrency, timeAgo } from '../../utils/formatters'
import { ORDER_STATUS_LABELS } from '../../utils/constants'

const PAGE_SIZE = 25

export default function OrderList() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    const params = { page, limit: PAGE_SIZE }
    if (statusFilter !== 'all') params.status = statusFilter
    ordersApi
      .getAll(params)
      .then((res) => {
        if (!alive) return
        setOrders(res.data || [])
        setTotal(res.pagination?.total ?? 0)
      })
      .catch(() => alive && setOrders([]))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [page, statusFilter])

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
      <PageHeader title="Orders" subtitle={`${total} total orders`}>
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
            onClick={() => { setStatusFilter(tab); setPage(1) }}
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
        data={orders}
        loading={loading}
        onRowClick={(row) => navigate(`/orders/${row.id}`)}
        pagination={{ total, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }}
        onPageChange={(newOffset) => setPage(Math.floor(newOffset / PAGE_SIZE) + 1)}
        emptyTitle="No orders found"
        emptyDescription="Try changing the status filter"
      />
    </div>
  )
}
