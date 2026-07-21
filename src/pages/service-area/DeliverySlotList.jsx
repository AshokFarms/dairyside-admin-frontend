import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import FormGrid from '../../components/ui/FormGrid'
import { serviceAreaApi } from '../../api'

export default function DeliverySlotList() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [form, setForm] = useState({ label: '', shift: 'morning', cutoff_time: '', display_order: 0, is_active: true })
  const [error, setError] = useState('')

  const fetchSlots = useCallback(() => {
    setLoading(true)
    serviceAreaApi
      .getDeliverySlots()
      .then((res) => {
        // Sort by display_order by default
        const sorted = (res.data || []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        setSlots(sorted)
      })
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleEditClick = (slot) => {
    setEditingSlot(slot)
    setForm({
      label: slot.label || '',
      shift: slot.shift || 'morning',
      cutoff_time: slot.cutoff_time || '',
      display_order: slot.display_order ?? 0,
      is_active: slot.is_active ?? true,
    })
    setError('')
    // Scroll to the edit form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUpdate = async () => {
    if (!editingSlot) return
    try {
      setBusy(true)
      setError('')

      // Format cutoff time appropriately (allow null if empty)
      const cutoff = form.cutoff_time && form.cutoff_time.trim() ? form.cutoff_time.trim() : null

      // Simple regex check if cutoff_time is provided
      if (cutoff && !/^\d{2}:\d{2}(:\d{2})?$/.test(cutoff)) {
        throw new Error('Cutoff time must be in HH:MM or HH:MM:SS format (e.g. 21:00 or 21:00:00)')
      }

      await serviceAreaApi.updateDeliverySlot(editingSlot.id, {
        label: form.label.trim(),
        shift: form.shift,
        cutoff_time: cutoff,
        display_order: Number(form.display_order) || 0,
        is_active: !!form.is_active,
      })

      setEditingSlot(null)
      fetchSlots()
    } catch (err) {
      setError(err.message || 'Failed to update delivery slot')
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async (row) => {
    try {
      setBusy(true)
      await serviceAreaApi.updateDeliverySlot(row.id, { is_active: !row.is_active })
      fetchSlots()
    } catch (err) {
      alert(err.message || 'Failed to toggle status')
    } finally {
      setBusy(false)
    }
  }

  const formatTime12h = (timeStr) => {
    if (!timeStr) return '—'
    const parts = timeStr.split(':')
    const hours = parseInt(parts[0], 10)
    const minutes = parts[1] || '00'
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes} ${ampm}`
  }

  const columns = [
    { key: 'label', header: 'Slot Label', render: (val) => <span style={{ fontWeight: 700 }}>{val}</span> },
    {
      key: 'shift', header: 'Shift',
      render: (val) => (
        <span style={{
          fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px', fontWeight: 600,
          background: val === 'morning' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(139, 92, 246, 0.1)',
          color: val === 'morning' ? '#d97706' : '#7c3aed',
          textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: '4px'
        }}>
          {val === 'morning' ? '☀ Morning' : '🌙 Evening'}
        </span>
      )
    },
    { key: 'cutoff_time', header: 'Cutoff Time', render: (val) => <span>{formatTime12h(val)} {val ? `(${val})` : ''}</span> },
    { key: 'display_order', header: 'Display Order', align: 'center', render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span> },
    {
      key: 'is_active', header: 'Status',
      render: (val) => (
        <span style={{
          fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
          background: val ? 'var(--color-success-light)' : 'var(--color-danger-light)',
          color: val ? 'var(--color-success)' : 'var(--color-danger)'
        }}>
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions', header: '', align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => handleEditClick(row)}>
            Configure
          </Button>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => toggleActive(row)}>
            {row.is_active ? 'Deactivate' : 'Activate'}
          </Button>
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
      <PageHeader title="Delivery Slots" subtitle={`${slots.length} delivery slots configured`}>
        {editingSlot && (
          <Button variant="ghost" size="sm" onClick={() => setEditingSlot(null)}>
            Cancel Configuration
          </Button>
        )}
      </PageHeader>

      {editingSlot && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
          padding: '20px', marginBottom: '16px',
        }} className="animate-fadeIn">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
            Configure Delivery Slot: {editingSlot.label}
          </h3>
          {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.8125rem', marginBottom: '10px' }}>{error}</div>}
          
          <FormGrid min={200} className="mb-3">
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 600 }}>Slot Label *</label>
              <input style={inputStyle} placeholder="e.g. Before 7 AM" value={form.label} onChange={e => setField('label', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 600 }}>Shift *</label>
              <select style={inputStyle} value={form.shift} onChange={e => setField('shift', e.target.value)}>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 600 }}>Cutoff Time (HH:MM or HH:MM:SS)</label>
              <input style={inputStyle} placeholder="e.g. 21:00 (Leave empty for none)" value={form.cutoff_time} onChange={e => setField('cutoff_time', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 600 }}>Display Order</label>
              <input style={inputStyle} type="number" min="0" value={form.display_order} onChange={e => setField('display_order', e.target.value)} />
            </div>
          </FormGrid>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <label style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setField('is_active', e.target.checked)} style={{ accentColor: 'var(--color-primary)' }} /> Is Active
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" size="md" disabled={busy || !form.label.trim()} onClick={handleUpdate}>
              {busy ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button variant="ghost" size="md" disabled={busy} onClick={() => setEditingSlot(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={slots} loading={loading} emptyTitle="No delivery slots found" />
    </div>
  )
}
