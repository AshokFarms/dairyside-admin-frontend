import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import FormGrid from '../../components/ui/FormGrid'
import { couponsApi } from '../../api'
import { formatCurrency, formatDate } from '../../utils/formatters'

const EMPTY_FORM = { code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: 0, max_discount: '', usage_limit: '', valid_until: '' }

export default function CouponList() {
  const [coupons, setCoupons] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const fetchCoupons = useCallback(() => {
    setLoading(true)
    couponsApi
      .getAll({ limit: 100 })
      .then((res) => {
        setCoupons(res.data || [])
        setTotal(res.pagination?.total ?? 0)
      })
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchCoupons() }, [fetchCoupons])

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleCreate = async () => {
    try {
      setBusy(true)
      setError('')
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount) || 0,
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        valid_until: form.valid_until || null,
      }
      await couponsApi.create(payload)
      setForm(EMPTY_FORM)
      setShowAdd(false)
      fetchCoupons()
    } catch (err) {
      setError(err.message || 'Failed to create coupon')
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async (row) => {
    try {
      setBusy(true)
      await couponsApi.update(row.id, { is_active: !row.is_active })
      fetchCoupons()
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete coupon ${row.code}?`)) return
    try {
      setBusy(true)
      await couponsApi.delete(row.id)
      fetchCoupons()
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    {
      key: 'code', header: 'Code',
      render: (val) => <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-primary-light)', fontSize: '0.875rem', background: 'rgba(99, 102, 241, 0.1)', padding: '3px 10px', borderRadius: '6px' }}>{val}</span>,
    },
    { key: 'description', header: 'Description', render: (val) => <span style={{ fontSize: '0.8125rem' }}>{val || '—'}</span> },
    {
      key: 'discount_value', header: 'Discount',
      render: (val, row) => <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{row.discount_type === 'percentage' ? `${val}%` : formatCurrency(val)}</span>,
    },
    { key: 'min_order_amount', header: 'Min Order', align: 'right', render: (val) => <span>{formatCurrency(val)}</span> },
    {
      key: 'used_count', header: 'Usage', align: 'center',
      render: (val, row) => <span style={{ fontWeight: 600 }}>{val}{row.usage_limit ? `/${row.usage_limit}` : ''}</span>,
    },
    { key: 'valid_until', header: 'Valid Until', render: (val) => val ? <span style={{ fontSize: '0.8rem', color: new Date(val) < new Date() ? 'var(--color-danger)' : 'var(--text-secondary)' }}>{formatDate(val)}</span> : <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No expiry</span> },
    { key: 'is_active', header: 'Status', render: (val) => <StatusBadge status={val ? 'active' : 'expired'} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => toggleActive(row)}>
            {row.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="danger" size="sm" disabled={busy} onClick={() => handleDelete(row)}>Delete</Button>
        </div>
      ),
    },
  ]

  const inputStyle = {
    background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
    padding: '8px 12px', color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none', width: '100%',
  }

  const canSave = form.code.trim().length >= 3 && Number(form.discount_value) > 0

  return (
    <div>
      <PageHeader title="Coupons" subtitle={`${total} coupons`}>
        <Button variant="primary" size="md" onClick={() => setShowAdd(v => !v)} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>
          {showAdd ? 'Close' : 'Create Coupon'}
        </Button>
      </PageHeader>

      {showAdd && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
          padding: '20px', marginBottom: '16px',
        }} className="animate-fadeIn">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>New coupon</h3>
          {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.8125rem', marginBottom: '10px' }}>{error}</div>}
          <FormGrid min={180} className="mb-3.5">
            <input style={inputStyle} placeholder="Code (e.g. FRESH20) *" value={form.code} onChange={e => setField('code', e.target.value.toUpperCase())} />
            <input style={inputStyle} placeholder="Description" value={form.description} onChange={e => setField('description', e.target.value)} />
            <select style={inputStyle} value={form.discount_type} onChange={e => setField('discount_type', e.target.value)}>
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
            <input style={inputStyle} type="number" min="1" placeholder={form.discount_type === 'percentage' ? 'Discount % *' : 'Discount ₹ *'} value={form.discount_value} onChange={e => setField('discount_value', e.target.value)} />
            <input style={inputStyle} type="number" min="0" placeholder="Min order ₹" value={form.min_order_amount} onChange={e => setField('min_order_amount', e.target.value)} />
            <input style={inputStyle} type="number" min="1" placeholder="Max discount ₹ (optional)" value={form.max_discount} onChange={e => setField('max_discount', e.target.value)} />
            <input style={inputStyle} type="number" min="1" placeholder="Usage limit (optional)" value={form.usage_limit} onChange={e => setField('usage_limit', e.target.value)} />
            <input style={inputStyle} type="date" value={form.valid_until} onChange={e => setField('valid_until', e.target.value)} />
          </FormGrid>
          <Button variant="primary" size="md" disabled={busy || !canSave} onClick={handleCreate}>
            {busy ? 'Saving…' : 'Save Coupon'}
          </Button>
        </div>
      )}

      <DataTable columns={columns} data={coupons} loading={loading} emptyTitle="No coupons found" emptyDescription="Create your first coupon to offer discounts" />
    </div>
  )
}
