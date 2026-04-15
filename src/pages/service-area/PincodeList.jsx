import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import { formatCurrency } from '../../utils/formatters'

const mockPincodes = [
  { id: 1, pincode: '302001', city: 'Jaipur', state: 'Rajasthan', delivery_fee: 0, min_order_amount: 200, is_active: true, morning: true, evening: true },
  { id: 2, pincode: '302002', city: 'Jaipur', state: 'Rajasthan', delivery_fee: 20, min_order_amount: 150, is_active: true, morning: true, evening: false },
  { id: 3, pincode: '302003', city: 'Jaipur', state: 'Rajasthan', delivery_fee: 25, min_order_amount: 100, is_active: true, morning: true, evening: true },
  { id: 4, pincode: '302004', city: 'Jaipur', state: 'Rajasthan', delivery_fee: 30, min_order_amount: 250, is_active: false, morning: true, evening: false },
  { id: 5, pincode: '302005', city: 'Jaipur', state: 'Rajasthan', delivery_fee: 0, min_order_amount: 300, is_active: true, morning: true, evening: true },
]

export default function PincodeList() {
  const columns = [
    { key: 'pincode', header: 'Pincode', render: (val) => <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>{val}</span> },
    { key: 'city', header: 'City', render: (val, row) => <span>{val}, {row.state}</span> },
    { key: 'delivery_fee', header: 'Fee', align: 'right', render: (val) => <span style={{ fontWeight: 600, color: val === 0 ? 'var(--color-success)' : 'var(--text-primary)' }}>{val === 0 ? 'Free' : formatCurrency(val)}</span> },
    { key: 'min_order_amount', header: 'Min Order', align: 'right', render: (val) => <span>{formatCurrency(val)}</span> },
    {
      key: 'morning', header: 'Slots',
      render: (val, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: val ? 'rgba(251, 191, 36, 0.1)' : 'var(--bg-tertiary)', color: val ? '#fbbf24' : 'var(--text-tertiary)', fontWeight: 600 }}>☀ AM</span>
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: row.evening ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-tertiary)', color: row.evening ? '#a78bfa' : 'var(--text-tertiary)', fontWeight: 600 }}>🌙 PM</span>
        </div>
      ),
    },
    {
      key: 'is_active', header: 'Status',
      render: (val) => <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: val ? 'var(--color-success-light)' : 'var(--color-danger-light)', color: val ? 'var(--color-success)' : 'var(--color-danger)' }}>{val ? 'Active' : 'Inactive'}</span>,
    },
    { key: 'actions', header: '', align: 'right', render: () => <Button variant="ghost" size="sm">Edit</Button> },
  ]

  return (
    <div>
      <PageHeader title="Service Areas" subtitle="Manage serviceable pincodes and delivery zones">
        <Button variant="primary" size="md" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>Add Pincode</Button>
      </PageHeader>
      <DataTable columns={columns} data={mockPincodes} emptyTitle="No serviceable areas configured" />
    </div>
  )
}
