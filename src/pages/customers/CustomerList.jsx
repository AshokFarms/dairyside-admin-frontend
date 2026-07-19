import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import { customersApi } from '../../api'
import { formatCurrency, formatDate, getInitials } from '../../utils/formatters'

const PAGE_SIZE = 20

export default function CustomerList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Debounced server-side search + pagination.
  useEffect(() => {
    let alive = true
    const t = setTimeout(() => {
      setLoading(true)
      const params = { page, limit: PAGE_SIZE }
      if (search.trim()) params.search = search.trim()
      customersApi
        .getAll(params)
        .then((res) => {
          if (!alive) return
          setCustomers(res.data || [])
          setTotal(res.pagination?.total ?? 0)
        })
        .catch(() => alive && setCustomers([]))
        .finally(() => alive && setLoading(false))
    }, search ? 300 : 0)
    return () => { alive = false; clearTimeout(t) }
  }, [page, search])

  const columns = [
    {
      key: 'name', header: 'Customer',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `hsl(${(row.id * 47) % 360}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
          }}>
            {getInitials(val)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (val) => <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}>{val || '—'}</span> },
    {
      key: 'wallet_balance', header: 'Wallet', align: 'right',
      render: (val) => <span style={{ fontWeight: 600, color: val > 0 ? 'var(--color-success)' : 'var(--text-tertiary)' }}>{formatCurrency(val)}</span>,
    },
    { key: 'total_orders', header: 'Orders', align: 'center', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    {
      key: 'active_subscriptions', header: 'Subs', align: 'center',
      render: (val) => val > 0 ? (
        <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{val} active</span>
      ) : <span style={{ color: 'var(--text-tertiary)' }}>—</span>,
    },
    {
      key: 'email_verified', header: 'Verified',
      render: (val) => val ? <span style={{ color: 'var(--color-success)' }}>✓ Verified</span> : <span style={{ color: 'var(--text-tertiary)' }}>Unverified</span>,
    },
    {
      key: 'created_at', header: 'Joined',
      render: (val) => <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{formatDate(val)}</span>,
    },
  ]

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${total} registered customers`}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', padding: '8px 14px', width: '240px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search customers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'inherit', width: '100%' }}
          />
        </div>
      </PageHeader>
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
        pagination={{ total, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }}
        onPageChange={(newOffset) => setPage(Math.floor(newOffset / PAGE_SIZE) + 1)}
        emptyTitle="No customers found"
        emptyDescription="Try searching with a different term"
      />
    </div>
  )
}
