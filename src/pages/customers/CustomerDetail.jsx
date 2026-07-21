import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import TableScroll from '../../components/ui/TableScroll'
import DataTable from '../../components/common/DataTable'
import { customersApi } from '../../api'
import { formatCurrency, formatDate, formatDateTime, getInitials } from '../../utils/formatters'

const SUBS_LIMIT = 5
const ORDERS_LIMIT = 5

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // State
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Subscriptions State (Client-side pagination)
  const [subscriptions, setSubscriptions] = useState([])
  const [subsPage, setSubsPage] = useState(1)

  // Orders State (Server-side pagination)
  const [orders, setOrders] = useState([])
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Wallet State
  const [walletData, setWalletData] = useState({ balance: 0, transactions: [] })

  // Wallet Modal State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [walletForm, setWalletForm] = useState({
    type: 'credit',
    amount: '',
    notes: '',
  })
  const [walletSubmitting, setWalletSubmitting] = useState(false)
  const [walletError, setWalletError] = useState('')

  // Initial Fetch: Profile, Subscriptions, Wallet Ledger
  const fetchBaseData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [custRes, subsRes, walletRes] = await Promise.all([
        customersApi.getById(id),
        customersApi.getSubscriptions(id),
        customersApi.getWallet(id, { limit: 50 }),
      ])

      setCustomer(custRes.data)
      setSubscriptions(subsRes.data || [])
      setWalletData(walletRes.data || { balance: 0, transactions: [] })
    } catch (err) {
      setError(err.message || 'Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }, [id])

  // Fetch Orders whenever page changes
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const ordersRes = await customersApi.getOrders(id, { page: ordersPage, limit: ORDERS_LIMIT })
      setOrders(ordersRes.data || [])
      setOrdersTotal(ordersRes.pagination?.total ?? 0)
    } catch (err) {
      console.error('Failed to load orders', err)
    } finally {
      setOrdersLoading(false)
    }
  }, [id, ordersPage])

  useEffect(() => {
    fetchBaseData()
  }, [fetchBaseData])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleWalletAdjust = async (e) => {
    e.preventDefault()
    if (!walletForm.amount || Number(walletForm.amount) <= 0) {
      setWalletError('Please enter a valid amount greater than 0')
      return
    }

    setWalletSubmitting(true)
    setWalletError('')
    try {
      await customersApi.adjustWallet(id, {
        type: walletForm.type,
        amount: Number(walletForm.amount),
        description: walletForm.notes || `${walletForm.type === 'credit' ? 'Manual credit' : 'Manual debit'} by Admin`,
      })
      setIsWalletModalOpen(false)
      setWalletForm({ type: 'credit', amount: '', notes: '' })
      // Re-fetch base data & reset order page to refresh view
      fetchBaseData()
      fetchOrders()
    } catch (err) {
      setWalletError(err.message || 'Failed to adjust wallet balance')
    } finally {
      setWalletSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading customer details..." />
  if (error && !customer) return <EmptyState title="Customer not found" description={error} />
  if (!customer) return null

  // Client-side pagination logic for subscriptions
  const paginatedSubscriptions = subscriptions.slice(
    (subsPage - 1) * SUBS_LIMIT,
    subsPage * SUBS_LIMIT
  )

  // DataTable column configurations
  const subscriptionColumns = [
    {
      key: 'product_name',
      header: 'Product',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.size_label}</div>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Schedule',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{val} units</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
            {row.frequency} ({row.delivery_slot})
          </div>
        </div>
      ),
    },
    {
      key: 'price_per_delivery',
      header: 'Price/Del.',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600 }}>{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val} size="sm" />,
    },
  ]

  const orderColumns = [
    {
      key: 'order_number',
      header: 'Order #',
      render: (val) => <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{val}</span>,
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (val, row) => (
        <div>
          <div style={{ fontSize: '0.8125rem' }}>{formatDate(val)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
            {row.order_type.replace(/_/g, ' ')}
          </div>
        </div>
      ),
    },
    {
      key: 'total_amount',
      header: 'Total',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600 }}>{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val} size="sm" />,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title={customer.name}
        subtitle={`Member since ${formatDate(customer.created_at)}`}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/customers')}>
            ← Back to Customers
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsWalletModalOpen(true)}>
            Adjust Wallet
          </Button>
        </div>
      </PageHeader>

      {/* Profile Overview Card */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
      }}>
        {/* Profile Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `hsl(${(customer.id * 47) % 360}, 60%, 50%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.25rem',
            flexShrink: 0,
          }}>
            {getInitials(customer.name)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{customer.name}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{customer.email}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Phone: {customer.phone || '—'}
            </div>
          </div>
        </div>

        {/* Wallet Balance Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '16px',
          borderLeft: '1px solid var(--border-default)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Wallet Balance
          </span>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: walletData.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
            marginTop: '4px',
          }}>
            {formatCurrency(walletData.balance)}
          </span>
        </div>

        {/* Active Subs Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '16px',
          borderLeft: '1px solid var(--border-default)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Subscriptions
          </span>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--color-primary-light)',
            marginTop: '4px',
          }}>
            {subscriptions.length} active
          </span>
        </div>

        {/* Total Orders Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '16px',
          borderLeft: '1px solid var(--border-default)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Orders
          </span>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginTop: '4px',
          }}>
            {ordersTotal}
          </span>
        </div>
      </div>

      {/* Main Tabs / Sections Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Row 1: Subscriptions & Recent Orders using DataTable */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          {/* Subscriptions Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              Active Subscriptions ({subscriptions.length})
            </h3>
            <DataTable
              columns={subscriptionColumns}
              data={paginatedSubscriptions}
              emptyTitle="No active subscriptions found"
              onRowClick={(row) => navigate(`/subscriptions/${row.id}`)}
              pagination={{
                total: subscriptions.length,
                limit: SUBS_LIMIT,
                offset: (subsPage - 1) * SUBS_LIMIT,
              }}
              onPageChange={(newOffset) => setSubsPage(Math.floor(newOffset / SUBS_LIMIT) + 1)}
            />
          </div>

          {/* Recent Orders Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              Recent Orders ({ordersTotal})
            </h3>
            <DataTable
              columns={orderColumns}
              data={orders}
              loading={ordersLoading}
              emptyTitle="No orders placed yet"
              onRowClick={(row) => navigate(`/orders/${row.id}`)}
              pagination={{
                total: ordersTotal,
                limit: ORDERS_LIMIT,
                offset: (ordersPage - 1) * ORDERS_LIMIT,
              }}
              onPageChange={(newOffset) => setOrdersPage(Math.floor(newOffset / ORDERS_LIMIT) + 1)}
            />
          </div>
        </div>

        {/* Row 2: Wallet Transaction Ledger */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Wallet Ledger & Transaction History
            </h3>
          </div>
          <TableScroll minWidth={600}>
            {walletData.transactions.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                No wallet transactions recorded.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {walletData.transactions.map((tx) => {
                    const isCredit = tx.type === 'credit'
                    return (
                      <tr key={tx.id}>
                        <td style={{ fontSize: '0.8125rem' }}>
                          {formatDateTime(tx.created_at)}
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: isCredit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isCredit ? 'var(--color-success)' : 'var(--color-danger)',
                          }}>
                            {tx.type}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'capitalize' }}>
                            {tx.reference_type || 'Manual'}
                          </div>
                          {tx.reference_id && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                              ID: #{tx.reference_id}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '280px', wordBreak: 'break-word' }}>
                          {tx.description || '—'}
                        </td>
                        <td style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          color: isCredit ? 'var(--color-success)' : 'var(--color-danger)',
                        }}>
                          {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {formatCurrency(tx.balance_after)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </TableScroll>
        </div>
      </div>

      {/* Adjust Wallet Balance Modal */}
      <Modal
        isOpen={isWalletModalOpen}
        onClose={() => {
          if (!walletSubmitting) {
            setIsWalletModalOpen(false)
            setWalletForm({ type: 'credit', amount: '', notes: '' })
            setWalletError('')
          }
        }}
        title="Adjust Wallet Balance"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsWalletModalOpen(false)
                setWalletForm({ type: 'credit', amount: '', notes: '' })
                setWalletError('')
              }}
              disabled={walletSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleWalletAdjust}
              disabled={walletSubmitting}
            >
              {walletSubmitting ? 'Submitting...' : 'Submit Adjustment'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleWalletAdjust} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {walletError && (
            <div style={{
              background: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: '0.8125rem',
            }}>
              {walletError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Adjustment Type *
            </label>
            <select
              value={walletForm.type}
              onChange={(e) => setWalletForm({ ...walletForm, type: e.target.value })}
              className="admin-select"
              required
            >
              <option value="credit">Credit (Add Money)</option>
              <option value="debit">Debit (Deduct Money)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Amount (₹) *
            </label>
            <input
              type="number"
              value={walletForm.amount}
              onChange={(e) => setWalletForm({ ...walletForm, amount: e.target.value })}
              placeholder="e.g. 500"
              className="admin-input"
              required
              min="0.01"
              step="0.01"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Remarks / Description *
            </label>
            <textarea
              value={walletForm.notes}
              onChange={(e) => setWalletForm({ ...walletForm, notes: e.target.value })}
              placeholder="e.g. Refund for cancelled order / Goodwill credit"
              className="admin-textarea"
              rows={3}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
