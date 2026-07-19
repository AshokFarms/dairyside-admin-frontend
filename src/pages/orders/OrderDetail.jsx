import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { ordersApi } from '../../api'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters'
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from '../../utils/constants'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  const fetchOrder = useCallback(() => {
    setLoading(true)
    ordersApi
      .getById(id)
      .then((res) => { setOrder(res.data); setError('') })
      .catch((err) => setError(err.message || 'Failed to load order'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const changeStatus = async (status) => {
    try {
      setUpdating(true)
      await ordersApi.updateStatus(id, { status })
      fetchOrder()
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading order..." />
  if (error && !order) return <EmptyState title="Order not found" description={error} />
  if (!order) return null

  const currentStepIndex = ORDER_STATUS_FLOW.indexOf(order.status)

  return (
    <div>
      <PageHeader
        title={`Order ${order.order_number}`}
        subtitle={`Created ${formatDateTime(order.created_at)}`}
      >
        <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>← Back to Orders</Button>
      </PageHeader>

      {error && (
        <div style={{
          background: 'var(--color-danger-light)', color: 'var(--color-danger)',
          border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)',
          padding: '12px 16px', marginBottom: '16px', fontSize: '0.8125rem', fontWeight: 500,
        }} role="alert">
          {error}
        </div>
      )}

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
          {currentStepIndex >= 0 && currentStepIndex < ORDER_STATUS_FLOW.length - 1 && (
            <Button
              variant="primary"
              size="md"
              disabled={updating}
              onClick={() => changeStatus(ORDER_STATUS_FLOW[currentStepIndex + 1])}
            >
              {updating ? 'Updating…' : `Move to ${ORDER_STATUS_LABELS[ORDER_STATUS_FLOW[currentStepIndex + 1]]}`}
            </Button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Button
              variant="danger"
              size="md"
              disabled={updating}
              onClick={() => window.confirm('Cancel this order?') && changeStatus('cancelled')}
            >
              Cancel Order
            </Button>
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
          {order.delivery_logs?.length > 0 && (
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
          )}
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
                {(order.customer?.name || '?').charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.customer?.name || 'Guest'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{order.customer?.email || '—'}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              📞 {order.customer?.phone || '—'}
            </div>
          </div>

          {/* Delivery Address */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)', padding: '20px',
          }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>Delivery Address</h3>
            {order.address ? (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {order.address.formatted || [order.address.flat_no, order.address.street_name, order.address.area].filter(Boolean).join(', ')}
                {order.address.pincode && <><br />PIN: {order.address.pincode}</>}
                {order.address.phone && <><br />📞 {order.address.phone}</>}
              </div>
            ) : (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>No address on this order</div>
            )}
          </div>

          {/* Payment & Delivery Info */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)', padding: '20px',
          }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>Details</h3>
            {[
              { label: 'Payment', value: <StatusBadge status={order.payment_status || 'pending'} size="sm" /> },
              { label: 'Method', value: order.payment_method || '—' },
              { label: 'Type', value: (order.order_type || '').replace(/_/g, ' ') || '—' },
              { label: 'Delivery', value: formatDate(order.delivery_date) },
              { label: 'Shift', value: order.delivery_shift ? `☀ ${order.delivery_shift}` : '—' },
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

        </div>
      </div>
    </div>
  )
}
