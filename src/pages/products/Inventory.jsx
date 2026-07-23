import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { inventoryApi } from '../../api'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'

// ── Stock state pill (mirrors the customer StockBadge) ──
function StatePill({ stock, threshold }) {
  const t = threshold == null ? null : Number(threshold)
  const state = stock <= 0 ? 'OUT_OF_STOCK' : t != null && stock <= t ? 'LOW_STOCK' : 'IN_STOCK'
  const map = {
    OUT_OF_STOCK: { label: 'Out of stock', bg: 'rgba(239,68,68,0.12)', fg: 'var(--color-danger)' },
    LOW_STOCK: { label: 'Low', bg: 'rgba(245,158,11,0.12)', fg: 'var(--color-warning)' },
    IN_STOCK: { label: 'In stock', bg: 'rgba(16,185,129,0.12)', fg: 'var(--color-success)' },
  }
  const s = map[state]
  return (
    <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  )
}

const REASON_META = {
  SALE: { color: 'var(--color-danger)' },
  CANCEL: { color: 'var(--color-success)' },
  RESTOCK: { color: 'var(--color-success)' },
  ADJUSTMENT: { color: 'var(--text-secondary)' },
  DAMAGE: { color: 'var(--color-danger)' },
}

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-default)', background: 'var(--bg-tertiary)',
  color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'inherit',
}
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, marginTop: 14 }

export default function Inventory() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [allRows, setAllRows] = useState([])
  const [allLoading, setAllLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ledger, setLedger] = useState([])
  const [ledgerLoading, setLedgerLoading] = useState(true)

  // Modal state: { type: 'restock'|'adjust'|'threshold', variant }
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const loadLowStock = useCallback(async () => {
    setLoading(true)
    try {
      const res = await inventoryApi.lowStock({ limit: 100 })
      setRows(res?.data || [])
    } catch (err) {
      toast.error(err?.error || 'Failed to load low-stock list')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAll = useCallback(async (searchTerm = '') => {
    setAllLoading(true)
    try {
      const res = await inventoryApi.variants({ limit: 100, search: searchTerm || undefined })
      setAllRows(res?.data || [])
    } catch (err) {
      toast.error(err?.error || 'Failed to load variants')
    } finally {
      setAllLoading(false)
    }
  }, [])

  const loadLedger = useCallback(async () => {
    setLedgerLoading(true)
    try {
      const res = await inventoryApi.ledger({ limit: 15 })
      setLedger(res?.data || [])
    } catch {
      /* ledger is secondary — a failure here shouldn't block the page */
    } finally {
      setLedgerLoading(false)
    }
  }, [])

  useEffect(() => { loadLowStock(); loadAll(); loadLedger() }, [loadLowStock, loadAll, loadLedger])

  const refreshAll = () => { loadLowStock(); loadAll(search); loadLedger() }

  const openModal = (type, variant) => {
    setForm(
      type === 'restock' ? { qty: '', note: '' }
        : type === 'adjust' ? { delta: '', reason: 'ADJUSTMENT', note: '' }
        : { threshold: variant.low_stock_threshold ?? '' }
    )
    setModal({ type, variant })
  }
  const closeModal = () => { if (!saving) { setModal(null); setForm({}) } }

  const submit = async () => {
    if (!modal) return
    const { type, variant } = modal
    const id = variant.product_variant_id
    setSaving(true)
    try {
      if (type === 'restock') {
        const qty = Number(form.qty)
        if (!Number.isInteger(qty) || qty <= 0) throw { error: 'Enter a positive whole number to add' }
        await inventoryApi.restock(id, { qty, note: form.note || undefined })
        toast.success(`Restocked +${qty}`)
      } else if (type === 'adjust') {
        const delta = Number(form.delta)
        if (!Number.isInteger(delta) || delta === 0) throw { error: 'Enter a non-zero whole number' }
        if (!form.note?.trim()) throw { error: 'A reason note is required' }
        await inventoryApi.adjust(id, { delta, reason: form.reason, note: form.note.trim() })
        toast.success('Stock adjusted')
      } else {
        const threshold = form.threshold === '' ? null : Number(form.threshold)
        await inventoryApi.setThreshold(id, { threshold })
        toast.success('Low-stock threshold updated')
      }
      setModal(null); setForm({})
      refreshAll()
    } catch (err) {
      toast.error(err?.error || err?.response?.data?.error || 'Action failed')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'product_name', label: 'Product',
      render: (_v, r) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.product_name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.size_label} · {r.sku}</div>
        </div>
      ),
    },
    { key: 'stock_quantity', label: 'Stock', align: 'right', render: (v) => <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{v}</span> },
    { key: 'effective_threshold', label: 'Threshold', align: 'right', render: (v, r) => (
      <span style={{ color: 'var(--text-secondary)' }}>{v}{r.low_stock_threshold == null ? ' (default)' : ''}</span>
    ) },
    { key: 'state', label: 'State', render: (_v, r) => <StatePill stock={r.stock_quantity} threshold={r.effective_threshold} /> },
    {
      key: 'actions', label: 'Actions', align: 'right',
      render: (_v, r) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button size="sm" variant="success" onClick={() => openModal('restock', r)}>Restock</Button>
          <Button size="sm" variant="secondary" onClick={() => openModal('adjust', r)}>Adjust</Button>
          <Button size="sm" variant="ghost" onClick={() => openModal('threshold', r)}>Threshold</Button>
        </div>
      ),
    },
  ]

  const ledgerColumns = [
    { key: 'created_at', label: 'When', render: (v) => new Date(v).toLocaleString() },
    { key: 'product_name', label: 'Product', render: (_v, r) => `${r.product_name} · ${r.size_label}` },
    { key: 'reason', label: 'Reason', render: (v) => <span style={{ fontWeight: 600, color: (REASON_META[v] || {}).color || 'var(--text-primary)' }}>{v}</span> },
    { key: 'delta', label: 'Δ', align: 'right', render: (v) => <span style={{ fontWeight: 700, color: v < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{v > 0 ? `+${v}` : v}</span> },
    { key: 'balance_after', label: 'After', align: 'right' },
    { key: 'actor', label: 'Actor', render: (v, r) => <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{v} ({r.actor_type})</span> },
  ]

  const modalTitle = modal
    ? modal.type === 'restock' ? `Restock — ${modal.variant.product_name} ${modal.variant.size_label}`
      : modal.type === 'adjust' ? `Adjust stock — ${modal.variant.product_name} ${modal.variant.size_label}`
      : `Low-stock threshold — ${modal.variant.product_name} ${modal.variant.size_label}`
    : ''

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Restock, adjust and set low-stock thresholds. Every change is ledgered and pushed to shoppers live."
        actions={<Button variant="secondary" onClick={refreshAll}>Refresh</Button>}
      />

      {/* ── All stock (act on any variant) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '8px 0 12px', flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>All stock</h3>
        <form
          onSubmit={(e) => { e.preventDefault(); loadAll(search) }}
          style={{ display: 'flex', gap: 8 }}
        >
          <input
            style={{ ...inputStyle, width: 240 }}
            placeholder="Search product or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="sm">Search</Button>
          {search && (
            <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(''); loadAll('') }}>Clear</Button>
          )}
        </form>
      </div>
      {allLoading ? (
        <p style={{ color: 'var(--text-tertiary)', padding: '24px 0' }}>Loading…</p>
      ) : allRows.length === 0 ? (
        <EmptyState title="No variants" description="No active variants match your search." />
      ) : (
        <DataTable columns={columns} data={allRows} />
      )}

      <h3 style={{ margin: '32px 0 12px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
        Low / out of stock ({rows.length})
      </h3>
      {loading ? (
        <p style={{ color: 'var(--text-tertiary)', padding: '24px 0' }}>Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="All stocked up" description="No active variants are at or below their low-stock threshold." />
      ) : (
        <DataTable columns={columns} data={rows} />
      )}

      <h3 style={{ margin: '32px 0 12px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Recent stock movements</h3>
      {ledgerLoading ? (
        <p style={{ color: 'var(--text-tertiary)', padding: '24px 0' }}>Loading…</p>
      ) : ledger.length === 0 ? (
        <EmptyState title="No movements yet" description="Sales, cancellations and admin changes will appear here." />
      ) : (
        <DataTable columns={ledgerColumns} data={ledger} />
      )}

      <Modal
        isOpen={!!modal}
        onClose={closeModal}
        title={modalTitle}
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={closeModal} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Confirm'}</Button>
          </div>
        }
      >
        {modal?.type === 'restock' && (
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Current stock: <strong>{modal.variant.stock_quantity}</strong>. Units to add:
            </p>
            <label style={labelStyle}>Quantity to add</label>
            <input style={inputStyle} type="number" min="1" value={form.qty}
              onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} autoFocus />
            <label style={labelStyle}>Note (optional)</label>
            <input style={inputStyle} value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="e.g. supplier delivery" />
          </div>
        )}

        {modal?.type === 'adjust' && (
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Current stock: <strong>{modal.variant.stock_quantity}</strong>. Use a negative delta to remove
              (e.g. spoilage/damage). Stock can never go below zero.
            </p>
            <label style={labelStyle}>Delta (+/−)</label>
            <input style={inputStyle} type="number" value={form.delta}
              onChange={(e) => setForm((f) => ({ ...f, delta: e.target.value }))} placeholder="e.g. -3" autoFocus />
            <label style={labelStyle}>Reason</label>
            <select style={inputStyle} value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}>
              <option value="ADJUSTMENT">Adjustment (correction)</option>
              <option value="DAMAGE">Damage / spoilage</option>
            </select>
            <label style={labelStyle}>Reason note (required)</label>
            <input style={inputStyle} value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Explain why — this is audited" />
          </div>
        )}

        {modal?.type === 'threshold' && (
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Flag this variant as "low stock" at or below this level. Leave blank to use the global default.
            </p>
            <label style={labelStyle}>Low-stock threshold</label>
            <input style={inputStyle} type="number" min="0" value={form.threshold}
              onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))} placeholder="blank = default" autoFocus />
          </div>
        )}
      </Modal>
    </div>
  )
}
