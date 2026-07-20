import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import FormGrid from '../../components/ui/FormGrid'
import { serviceAreaApi } from '../../api'
import { formatCurrency } from '../../utils/formatters'

const EMPTY_FORM = { pincode: '', area_name: '', city: '', state: '', delivery_fee: 0, min_order_amount: 0, morning: true, evening: true }

export default function PincodeList() {
  const [pincodes, setPincodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const fetchPincodes = useCallback(() => {
    setLoading(true)
    serviceAreaApi
      .getPincodes({ limit: 100 })
      .then((res) => setPincodes(res.data || []))
      .catch(() => setPincodes([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchPincodes() }, [fetchPincodes])

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleAdd = async () => {
    try {
      setBusy(true)
      setError('')
      await serviceAreaApi.createPincode({
        ...form,
        delivery_fee: Number(form.delivery_fee) || 0,
        min_order_amount: Number(form.min_order_amount) || 0,
      })
      setForm(EMPTY_FORM)
      setShowAdd(false)
      fetchPincodes()
    } catch (err) {
      setError(err.message || 'Failed to add pincode')
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async (row) => {
    try {
      setBusy(true)
      await serviceAreaApi.updatePincode(row.id, { is_active: !row.is_active })
      fetchPincodes()
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete pincode ${row.pincode}? Customers there will see "not serviceable".`)) return
    try {
      setBusy(true)
      await serviceAreaApi.deletePincode(row.id)
      fetchPincodes()
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    { key: 'pincode', header: 'Pincode', render: (val) => <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>{val}</span> },
    { key: 'area_name', header: 'Area', render: (val, row) => <span>{[val, row.city].filter(Boolean).join(', ') || '—'}</span> },
    { key: 'delivery_fee', header: 'Fee', align: 'right', render: (val) => <span style={{ fontWeight: 600, color: Number(val) === 0 ? 'var(--color-success)' : 'var(--text-primary)' }}>{Number(val) === 0 ? 'Free' : formatCurrency(val)}</span> },
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

  return (
    <div>
      <PageHeader title="Service Areas" subtitle={`${pincodes.length} serviceable pincodes`}>
        <Button variant="primary" size="md" onClick={() => setShowAdd(v => !v)} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>
          {showAdd ? 'Close' : 'Add Pincode'}
        </Button>
      </PageHeader>

      {showAdd && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
          padding: '20px', marginBottom: '16px',
        }} className="animate-fadeIn">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>New serviceable pincode</h3>
          {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.8125rem', marginBottom: '10px' }}>{error}</div>}
          <FormGrid min={160} className="mb-3">
            <input style={inputStyle} placeholder="Pincode (6 digits) *" value={form.pincode} maxLength={6} onChange={e => setField('pincode', e.target.value.replace(/\D/g, ''))} />
            <input style={inputStyle} placeholder="Area name" value={form.area_name} onChange={e => setField('area_name', e.target.value)} />
            <input style={inputStyle} placeholder="City" value={form.city} onChange={e => setField('city', e.target.value)} />
            <input style={inputStyle} placeholder="State" value={form.state} onChange={e => setField('state', e.target.value)} />
            <input style={inputStyle} type="number" min="0" placeholder="Delivery fee (₹)" value={form.delivery_fee} onChange={e => setField('delivery_fee', e.target.value)} />
            <input style={inputStyle} type="number" min="0" placeholder="Min order (₹)" value={form.min_order_amount} onChange={e => setField('min_order_amount', e.target.value)} />
          </FormGrid>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <label style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.morning} onChange={e => setField('morning', e.target.checked)} style={{ accentColor: 'var(--color-primary)' }} /> ☀ Morning slot
            </label>
            <label style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.evening} onChange={e => setField('evening', e.target.checked)} style={{ accentColor: 'var(--color-primary)' }} /> 🌙 Evening slot
            </label>
          </div>
          <Button variant="primary" size="md" disabled={busy || form.pincode.length !== 6} onClick={handleAdd}>
            {busy ? 'Saving…' : 'Save Pincode'}
          </Button>
        </div>
      )}

      <DataTable columns={columns} data={pincodes} loading={loading} emptyTitle="No serviceable areas configured" />
    </div>
  )
}
