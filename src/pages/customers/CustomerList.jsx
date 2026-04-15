import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import { formatCurrency, formatDate, getInitials } from '../../utils/formatters'

const mockCustomers = Array.from({ length: 20 }, (_, i) => {
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Devi', 'Vikram Patel', 'Neha Gupta', 'Rohit Agarwal', 'Kavita Rao', 'Deepak Joshi', 'Anita Verma']
  return {
    id: i + 1,
    name: names[i % names.length],
    email: `${names[i % names.length].toLowerCase().replace(/ /g, '.')}@email.com`,
    phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
    wallet_balance: Math.floor(Math.random() * 1000),
    total_orders: Math.floor(Math.random() * 50) + 1,
    active_subscriptions: Math.floor(Math.random() * 3),
    is_verified: i % 3 !== 2,
    created_at: new Date(Date.now() - i * 86400000 * 10).toISOString(),
    last_order: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  }
})

export default function CustomerList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = mockCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

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
    { key: 'phone', header: 'Phone', render: (val) => <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}>{val}</span> },
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
      key: 'is_verified', header: 'Verified',
      render: (val) => val ? <span style={{ color: 'var(--color-success)' }}>✓ Verified</span> : <span style={{ color: 'var(--text-tertiary)' }}>Unverified</span>,
    },
    {
      key: 'last_order', header: 'Last Order',
      render: (val) => <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{formatDate(val)}</span>,
    },
  ]

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${mockCustomers.length} registered customers`}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', padding: '8px 14px', width: '240px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'inherit', width: '100%' }}
          />
        </div>
      </PageHeader>
      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
        pagination={{ total: filtered.length, limit: 20, offset: 0 }}
        emptyTitle="No customers found"
        emptyDescription="Try searching with a different term"
      />
    </div>
  )
}
