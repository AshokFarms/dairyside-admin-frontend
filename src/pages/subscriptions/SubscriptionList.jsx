import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import { subscriptionsApi } from '../../api'
import { formatCurrency, formatDate } from '../../utils/formatters'

const PAGE_SIZE = 20

// Slot text → shift bucket (slots are labels like 'Before 7 AM' / '6 PM – 9 PM').
const shiftOf = (slot) => (String(slot || '').toLowerCase().includes('pm') && !String(slot || '').toLowerCase().startsWith('before') ? 'evening' : 'morning')

export default function SubscriptionList() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')
  const [subs, setSubs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    const params = { page, limit: PAGE_SIZE }
    if (statusFilter !== 'all') params.status = statusFilter
    subscriptionsApi
      .getAll(params)
      .then((res) => {
        if (!alive) return
        setSubs(res.data || [])
        setTotal(res.pagination?.total ?? 0)
      })
      .catch(() => alive && setSubs([]))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [page, statusFilter])

  const columns = [
    { key: 'id', header: 'ID', width: '60px', render: (val) => <span style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>#{val}</span> },
    {
      key: 'customer_name', header: 'Customer',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'product_name', header: 'Product',
      render: (val, row) => {
        // Compute human-readable volume from packet qty × variant size
        const qty = Number(row.quantity) || 1;
        const sl = (row.variant_label || '').toLowerCase().replace(/\s+/g, '');
        let volLabel = `${qty} × ${row.variant_label || 'unit'}`;
        if (sl.endsWith('ml')) {
          const ml = parseFloat(sl) * qty;
          volLabel = ml >= 1000 ? `${(ml/1000).toFixed(1).replace(/\.0$/,'')} L` : `${ml} ml`;
        } else if (sl.endsWith('gm') || sl.endsWith('g')) {
          const gm = parseFloat(sl) * qty;
          volLabel = gm >= 1000 ? `${(gm/1000).toFixed(1).replace(/\.0$/,'')} kg` : `${gm} g`;
        } else if (sl.endsWith('kg')) {
          volLabel = `${(parseFloat(sl)*qty).toFixed(1).replace(/\.0$/,'')} kg`;
        } else if (sl.endsWith('l')) {
          volLabel = `${(parseFloat(sl)*qty).toFixed(1).replace(/\.0$/,'')} L`;
        }
        return (
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {volLabel} / delivery
            </div>
          </div>
        );
      },
    },
    {
      key: 'frequency', header: 'Frequency',
      render: (val) => (
        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--color-primary-light)', textTransform: 'capitalize' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'delivery_slot', header: 'Delivery Slot',
      render: (val) => {
        const shift = shiftOf(val)
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 600 }}>
              {shift === 'morning' ? '☀' : '🌙'} {shift}
            </span>
            {val && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2.5px', whiteSpace: 'nowrap' }}>
                ⏰ {val}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'price_per_delivery', header: 'Per Delivery', align: 'right',
      render: (val) => <span style={{ fontWeight: 600 }}>{formatCurrency(val)}</span>,
    },
    {
      key: 'next_delivery', header: 'Next Delivery',
      render: (val) => val
        ? <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-success)' }}>{formatDate(val)}</span>
        : <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>—</span>,
    },
    { key: 'start_date', header: 'Started', render: (val) => <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{formatDate(val)}</span> },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
  ]

  return (
    <div>
      <PageHeader title="Subscriptions" subtitle={`${total} total subscriptions`} />
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--border-default)', width: 'fit-content', maxWidth: '100%', overflowX: 'auto' }}>
        {['all', 'active', 'paused', 'cancelled'].map(tab => (
          <button key={tab} onClick={() => { setStatusFilter(tab); setPage(1) }}
            style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: statusFilter === tab ? 'var(--color-primary)' : 'transparent', color: statusFilter === tab ? 'white' : 'var(--text-secondary)', transition: 'all var(--transition-fast)', textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>
      <DataTable
        columns={columns}
        data={subs}
        loading={loading}
        onRowClick={(r) => navigate(`/subscriptions/${r.id}`)}
        pagination={{ total, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }}
        onPageChange={(newOffset) => setPage(Math.floor(newOffset / PAGE_SIZE) + 1)}
        emptyTitle="No subscriptions found"
      />
    </div>
  )
}
