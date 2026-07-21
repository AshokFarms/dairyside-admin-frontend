import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import { subscriptionsApi } from '../../api'
import { formatDate } from '../../utils/formatters'

const PAGE_SIZE = 20

export default function TrialPackList() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [claims, setClaims] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    const params = { page, limit: PAGE_SIZE }
    if (statusFilter !== 'all') params.status = statusFilter

    subscriptionsApi
      .getTrialPacks(params)
      .then((res) => {
        if (!alive) return
        setClaims(res.data || [])
        setTotal(res.pagination?.total ?? res.total ?? 0)
      })
      .catch(() => alive && setClaims([]))
      .finally(() => alive && setLoading(false))

    return () => {
      alive = false
    }
  }, [page, statusFilter])

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)', fontWeight: 600 }}>
          #{val}
        </span>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>,
    },
    {
      key: 'product_name',
      header: 'Product / Variant',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
          {row.variant_label && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                background: 'var(--bg-tertiary)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {row.variant_label}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'claimed_at',
      header: 'Claimed At',
      render: (val) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: 'delivery_date',
      header: 'Delivery Date',
      render: (val) =>
        val ? (
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 550 }}>
            {formatDate(val)}
          </span>
        ) : (
          <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Not scheduled</span>
        ),
    },
    {
      key: 'order_id',
      header: 'Linked Order',
      render: (val) =>
        val ? (
          <Link
            to={`/orders/${val}`}
            style={{
              color: 'var(--color-primary-light)',
              textDecoration: 'none',
              fontWeight: 650,
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color var(--transition-fast)',
            }}
            onMouseOver={(e) => (e.target.style.color = 'var(--color-primary)')}
            onMouseOut={(e) => (e.target.style.color = 'var(--color-primary-light)')}
          >
            Order #{val} →
          </Link>
        ) : (
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
  ]

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Trial Packs" subtitle={`${total} total trial pack claims`} />

      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          border: '1px solid var(--border-default)',
          width: 'fit-content',
          maxWidth: '100%',
          overflowX: 'auto',
        }}
      >
        {['all', 'claimed', 'scheduled', 'delivered', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setStatusFilter(tab)
              setPage(1)
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              background: statusFilter === tab ? 'var(--color-primary)' : 'transparent',
              color: statusFilter === tab ? 'white' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={claims}
        loading={loading}
        pagination={{ total, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }}
        onPageChange={(newOffset) => setPage(Math.floor(newOffset / PAGE_SIZE) + 1)}
        emptyTitle="No trial pack claims found"
        emptyDescription="There are no trial pack claims matching the selected status filter."
      />
    </div>
  )
}
