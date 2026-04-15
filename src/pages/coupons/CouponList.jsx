import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import { formatCurrency, formatDate } from '../../utils/formatters'

const mockCoupons = [
  { id: 1, code: 'FRESH20', description: '20% off on first order', discount_type: 'percentage', discount_value: 20, min_order_amount: 200, max_discount: 100, usage_limit: 500, used_count: 234, is_active: true, valid_from: '2026-04-01', valid_until: '2026-04-30' },
  { id: 2, code: 'MILK50', description: '₹50 off on milk products', discount_type: 'flat', discount_value: 50, min_order_amount: 300, max_discount: 50, usage_limit: 1000, used_count: 567, is_active: true, valid_from: '2026-03-15', valid_until: '2026-05-15' },
  { id: 3, code: 'DAIRYSIDE10', description: '10% off storewide', discount_type: 'percentage', discount_value: 10, min_order_amount: 150, max_discount: 75, usage_limit: null, used_count: 892, is_active: true, valid_from: '2026-01-01', valid_until: '2026-12-31' },
  { id: 4, code: 'SUMMER25', description: 'Summer sale 25% off', discount_type: 'percentage', discount_value: 25, min_order_amount: 500, max_discount: 200, usage_limit: 200, used_count: 200, is_active: false, valid_from: '2026-03-01', valid_until: '2026-03-31' },
]

export default function CouponList() {
  const columns = [
    {
      key: 'code', header: 'Code',
      render: (val) => <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-primary-light)', fontSize: '0.875rem', background: 'rgba(99, 102, 241, 0.1)', padding: '3px 10px', borderRadius: '6px' }}>{val}</span>,
    },
    { key: 'description', header: 'Description', render: (val) => <span style={{ fontSize: '0.8125rem' }}>{val}</span> },
    {
      key: 'discount_value', header: 'Discount',
      render: (val, row) => <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{row.discount_type === 'percentage' ? `${val}%` : formatCurrency(val)}</span>,
    },
    { key: 'min_order_amount', header: 'Min Order', align: 'right', render: (val) => <span>{formatCurrency(val)}</span> },
    {
      key: 'used_count', header: 'Usage', align: 'center',
      render: (val, row) => <span style={{ fontWeight: 600 }}>{val}{row.usage_limit ? `/${row.usage_limit}` : ''}</span>,
    },
    { key: 'valid_until', header: 'Valid Until', render: (val) => <span style={{ fontSize: '0.8rem', color: new Date(val) < new Date() ? 'var(--color-danger)' : 'var(--text-secondary)' }}>{formatDate(val)}</span> },
    { key: 'is_active', header: 'Status', render: (val) => <StatusBadge status={val ? 'active' : 'expired'} /> },
  ]

  return (
    <div>
      <PageHeader title="Coupons" subtitle={`${mockCoupons.length} coupons`}>
        <Button variant="primary" size="md" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>
          Create Coupon
        </Button>
      </PageHeader>
      <DataTable columns={columns} data={mockCoupons} emptyTitle="No coupons found" />
    </div>
  )
}
