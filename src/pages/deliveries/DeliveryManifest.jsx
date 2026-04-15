import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import { formatDate } from '../../utils/formatters'

const mockDeliveries = Array.from({ length: 18 }, (_, i) => {
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Devi', 'Vikram Patel', 'Neha Gupta']
  const products = ['A2 Cow Milk (500ml)', 'Buffalo Milk (1L)', 'Paneer (200g)', 'Dahi (400g)', 'Toned Milk (500ml)', 'Ghee (500ml)']
  const statuses = ['pending', 'pending', 'out_for_delivery', 'delivered', 'delivered', 'delivered']
  return {
    id: i + 1,
    order_number: `SWD260411-${String(i + 20).padStart(4, '0')}`,
    customer: names[i % names.length],
    pincode: ['302001', '302002', '302003', '302004'][i % 4],
    items: products[i % products.length],
    shift: i < 10 ? 'morning' : 'evening',
    status: statuses[i % statuses.length],
    address: `${Math.floor(Math.random() * 100) + 1}, ${['Green Park', 'Sector 7', 'Old City', 'MG Road'][i % 4]}`,
  }
})

export default function DeliveryManifest() {
  const [shiftFilter, setShiftFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState(new Set())

  const filtered = mockDeliveries.filter(d => shiftFilter === 'all' || d.shift === shiftFilter)
  const pendingCount = mockDeliveries.filter(d => d.status === 'pending').length
  const deliveredCount = mockDeliveries.filter(d => d.status === 'delivered').length

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <PageHeader title="Today's Deliveries" subtitle={`${formatDate(new Date().toISOString())} · ${mockDeliveries.length} deliveries`}>
        {selectedIds.size > 0 && (
          <Button variant="success" size="md">Mark {selectedIds.size} as Delivered</Button>
        )}
      </PageHeader>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total', value: mockDeliveries.length, color: 'var(--text-primary)' },
          { label: 'Pending', value: pendingCount, color: 'var(--color-warning)' },
          { label: 'Delivered', value: deliveredCount, color: 'var(--color-success)' },
          { label: 'Morning', value: mockDeliveries.filter(d => d.shift === 'morning').length, color: '#fbbf24' },
          { label: 'Evening', value: mockDeliveries.filter(d => d.shift === 'evening').length, color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            padding: '14px 20px', textAlign: 'center', flex: 1,
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Shift Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--border-default)', width: 'fit-content' }}>
        {['all', 'morning', 'evening'].map(tab => (
          <button key={tab} onClick={() => setShiftFilter(tab)}
            style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: shiftFilter === tab ? 'var(--color-primary)' : 'transparent', color: shiftFilter === tab ? 'white' : 'var(--text-secondary)', textTransform: 'capitalize' }}>
            {tab === 'morning' ? '☀ Morning' : tab === 'evening' ? '🌙 Evening' : 'All'}
          </button>
        ))}
      </div>

      {/* Delivery List */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Address</th>
              <th>Pincode</th>
              <th>Shift</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <td>
                  <input type="checkbox" checked={selectedIds.has(d.id)} onChange={() => toggleSelect(d.id)}
                    style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                    disabled={d.status === 'delivered'}
                  />
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-light)' }}>{d.order_number}</td>
                <td style={{ fontWeight: 600 }}>{d.customer}</td>
                <td style={{ fontSize: '0.8125rem' }}>{d.items}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.address}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{d.pincode}</td>
                <td>
                  <span style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                    {d.shift === 'morning' ? '☀' : '🌙'} {d.shift}
                  </span>
                </td>
                <td><StatusBadge status={d.status} size="sm" /></td>
                <td>
                  {d.status !== 'delivered' && (
                    <Button variant="success" size="sm">✓ Complete</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
