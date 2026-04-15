import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters'
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from '../../utils/constants'

const mockOrder = {
  id: 1,
  order_number: 'SWD260411-0042',
  status: 'processing',
  order_type: 'one_time',
  payment_status: 'paid',
  payment_method: 'UPI',
  delivery_shift: 'morning',
  delivery_date: '2026-04-12',
  subtotal: 285,
  delivery_fee: 0,
  discount: 20,
  wallet_used: 0,
  total_amount: 265,
  coupon_code: 'FRESH20',
  notes: 'Please deliver before 7 AM',
  admin_notes: '',
  created_at: '2026-04-11T08:30:00Z',
  updated_at: '2026-04-11T09:15:00Z',
  customer: {
    id: 101,
    name: 'Rajesh Kumar',
    email: 'rajesh@email.com',
    phone: '+91 9876543210',
  },
  address: {
    label: 'Home',
    full_name: 'Rajesh Kumar',
    address_line1: '42, Green Park Colony',
    address_line2: 'Near SBI Bank',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
  },
  items: [
    { id: 1, product_name: 'A2 Cow Milk', variant_label: '500ml', quantity: 2, unit_price: 45, total_price: 90 },
    { id: 2, product_name: 'Paneer (Fresh)', variant_label: '200g', quantity: 1, unit_price: 85, total_price: 85 },
    { id: 3, product_name: 'Dahi (Curd)', variant_label: '400g', quantity: 2, unit_price: 55, total_price: 110 },
  ],
  delivery_logs: [
    { status: 'pending', notes: 'Order placed by customer', created_at: '2026-04-11T08:30:00Z' },
    { status: 'confirmed', notes: 'Payment verified', created_at: '2026-04-11T08:32:00Z' },
    { status: 'processing', notes: 'Order being packed', created_at: '2026-04-11T09:15:00Z' },
  ],
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order] = useState(mockOrder)
  const [adminNotes, setAdminNotes] = useState(order.admin_notes)

  const currentStepIndex = ORDER_STATUS_FLOW.indexOf(order.status)

  return (
    <div>
      <PageHeader
        title={`Order ${order.order_number}`}
        subtitle={`Created ${formatDateTime(order.created_at)}`}
      >
        <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>← Back to Orders</Button>
        <Button variant="secondary" size="sm">Print Invoice</Button>
      </PageHeader>

      {/* Status Flow */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)', padding: '24px', marginBottom: '20px',
      }} className="animate-fadeIn">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative',
        }}>
          {ORDER_STATUS_FLOW.map((status, i) => {
            const isComplete = i <= currentStepIndex
            const isCurrent = i === currentStepIndex
            return (
              <div key={status} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1,
                position: 'relative', zIndex: 1,
              }}>
                <div style={{
                  width: isCurrent ? 40 : 32, height: isCurrent ? 40 : 32,
                  borderRadius: '50%',
                  background: isComplete ? 'linear-gradient(135deg, var(--color-primary), #8b5cf6)' : 'var(--bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isComplete ? 'white' : 'var(--text-tertiary)',
                  transition: 'all var(--transition-base)',
                  boxShadow: isCurrent ? 'var(--shadow-glow)' : 'none',
                }}>
                  {isComplete && !isCurrent ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</span>
                  )}
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: isCurrent ? 700 : 500, marginTop: '8px',
                  color: isComplete ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  textAlign: 'center',
                }}>
                  {ORDER_STATUS_LABELS[status]}
                </span>
              </div>
            )
          })}
          {/* Progress line */}
          <div style={{
            position: 'absolute', top: '18px', left: '10%', right: '10%', height: '3px',
            background: 'var(--bg-tertiary)', zIndex: 0, borderRadius: '2px',
          }}>
            <div style={{
              width: `${(currentStepIndex / (ORDER_STATUS_FLOW.length - 1)) * 100}%`,
              height: '100%', background: 'linear-gradient(90deg, var(--color-primary), #8b5cf6)',
              borderRadius: '2px', transition: 'width 500ms ease',
            }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
          {currentStepIndex < ORDER_STATUS_FLOW.length - 1 && (
            <Button variant="primary" size="md">
              Move to {ORDER_STATUS_LABELS[ORDER_STATUS_FLOW[currentStepIndex + 1]]}
            </Button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Button variant="danger" size="md">Cancel Order</Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Order Items */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)', overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Order Items ({order.items.length})
              </h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{item.product_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.variant_label}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Totals */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-default)' }}>
              {[
                { label: 'Subtotal', value: order.subtotal },
                { label: 'Delivery Fee', value: order.delivery_fee },
                { label: `Discount ${order.coupon_code ? `(${order.coupon_code})` : ''}`, value: -order.discount },
              ].map(({ label, value }, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '4px 0',
                  fontSize: '0.8125rem', color: 'var(--text-secondary)',
                }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 500, color: value < 0 ? 'var(--color-success)' : undefined }}>
                    {value < 0 ? `- ${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
                  </span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 0 0',
                marginTop: '8px', borderTop: '1px solid var(--border-default)',
                fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)',
              }}>
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Timeline */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)', padding: '20px',
          }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>
              Activity Timeline
            </h3>
            {order.delivery_logs.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: i < order.delivery_logs.length - 1 ? '16px' : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: i === order.delivery_logs.length - 1 ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                    border: i === order.delivery_logs.length - 1 ? '2px solid var(--color-primary-light)' : '2px solid var(--border-hover)',
                    flexShrink: 0, marginTop: '4px',
                  }} />
                  {i < order.delivery_logs.length - 1 && (
                    <div style={{ width: '2px', flex: 1, background: 'var(--border-default)', marginTop: '4px' }} />
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2px' }}>
                    <StatusBadge status={log.status} size="sm" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>{log.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Customer Info */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)', padding: '20px',
          }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>Customer</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '0.875rem',
              }}>
                {order.customer.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.customer.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{order.customer.email}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              📞 {order.customer.phone}
            </div>
          </div>

          {/* Delivery Address */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)', padding: '20px',
          }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>Delivery Address</h3>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
                background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', marginBottom: '8px', display: 'inline-block',
              }}>
                {order.address.label}
              </span>
              <br />
              {order.address.full_name}<br />
              {order.address.address_line1}<br />
              {order.address.address_line2 && <>{order.address.address_line2}<br /></>}
              {order.address.city}, {order.address.state} - {order.address.pincode}
            </div>
          </div>

          {/* Payment & Delivery Info */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)', padding: '20px',
          }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>Details</h3>
            {[
              { label: 'Payment', value: <StatusBadge status={order.payment_status} size="sm" /> },
              { label: 'Method', value: order.payment_method },
              { label: 'Type', value: order.order_type.replace(/_/g, ' ') },
              { label: 'Delivery', value: formatDate(order.delivery_date) },
              { label: 'Shift', value: `☀ ${order.delivery_shift}` },
            ].map(({ label, value }, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border-default)' : 'none',
                fontSize: '0.8125rem',
              }}>
                <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Admin Notes */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)', padding: '20px',
          }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>Admin Notes</h3>
            <textarea
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              placeholder="Add internal notes..."
              rows={3}
              style={{
                width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-primary)',
                fontSize: '0.8125rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none',
              }}
            />
            <Button variant="secondary" size="sm" style={{ marginTop: '8px' }}>Save Notes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
