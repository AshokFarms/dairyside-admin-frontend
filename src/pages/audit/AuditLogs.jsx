import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { auditApi } from '../../api'

const PAGE_SIZE = 25

// Timestamps are stored UTC; admins read them in India time.
const IST = 'Asia/Kolkata'
const fmtIST = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: IST, day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

// Group actions by domain so the badge colour carries meaning at a glance.
const ACTION_TONE = (action = '') => {
  if (action.startsWith('PAYMENT') || action === 'WALLET_RECHARGE' || action === 'INVOICE_PAID')
    return { bg: 'rgba(16,185,129,0.12)', fg: '#34d399' }        // money
  if (action.startsWith('CART')) return { bg: 'rgba(148,163,184,0.14)', fg: '#94a3b8' }   // cart
  if (action.startsWith('SUBSCRIPTION') || action === 'QTY_CHANGE' || action === 'SKIP_DAY' || action === 'QTY_OVERRIDE')
    return { bg: 'rgba(99,102,241,0.14)', fg: '#818cf8' }        // subscription
  if (action.startsWith('ORDER') || action === 'TRIAL_CLAIM') return { bg: 'rgba(245,158,11,0.14)', fg: '#fbbf24' }
  if (action === 'LOGIN' || action === 'LOGOUT') return { bg: 'rgba(59,130,246,0.14)', fg: '#60a5fa' }
  if (action === 'AUDIT_DELETE') return { bg: 'rgba(239,68,68,0.14)', fg: '#f87171' }      // trail pruned by an admin
  return { bg: 'var(--bg-tertiary)', fg: 'var(--text-secondary)' }
}

const val = (v) =>
  v === null || v === undefined || v === '' ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v)

/** before → after detail for one entry (rendered inside a Modal so the 3-column
 *  diff gets full width instead of being clipped inside a table cell). */
function DiffView({ entry }) {
  const { changes = [], context = {} } = entry
  return (
    <div>
      {changes.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          No field-level changes recorded for this event.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: 320 }}>
            <thead>
              <tr style={{ color: 'var(--text-tertiary)', textAlign: 'left' }}>
                <th style={{ padding: '4px 8px', fontWeight: 600 }}>Field</th>
                <th style={{ padding: '4px 8px', fontWeight: 600 }}>Before</th>
                <th style={{ padding: '4px 8px', fontWeight: 600 }}>After</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((c, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border-default)' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {c.field}
                  </td>
                  <td style={{ padding: '6px 8px', color: '#fca5a5', wordBreak: 'break-word' }}>{val(c.old)}</td>
                  <td style={{ padding: '6px 8px', color: '#6ee7b7', wordBreak: 'break-word' }}>{val(c.new)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-default)',
        display: 'grid', gap: '6px', fontSize: '0.72rem', color: 'var(--text-tertiary)',
      }}>
        <div><strong style={{ color: 'var(--text-secondary)' }}>IP:</strong> {val(context.ip)}</div>
        <div><strong style={{ color: 'var(--text-secondary)' }}>Request id:</strong> {val(context.request_id)}</div>
        <div style={{ wordBreak: 'break-word' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>User agent:</strong> {val(context.user_agent)}
        </div>
      </div>
    </div>
  )
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [facets, setFacets] = useState({ actions: [], entityTypes: [], sources: [] })
  const [filters, setFilters] = useState({
    search: '', action: '', entityType: '', source: '', success: '', dateFrom: '', dateTo: '',
  })

  // Deletion state. `confirm` holds the pending request plus the row count the
  // server says it will remove, so the dialog can state the real blast radius.
  const [selected, setSelected] = useState(() => new Set())
  const [confirm, setConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [askAge, setAskAge] = useState(false)
  const [ageDays, setAgeDays] = useState('90')

  useEffect(() => {
    auditApi.getFacets().then((r) => setFacets(r.data || { actions: [], entityTypes: [], sources: [] })).catch(() => {})
  }, [])

  const fetchLogs = useCallback(() => {
    setLoading(true)
    const params = { page, limit: PAGE_SIZE }
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) params[k] = v
    })
    auditApi
      .getAll(params)
      .then((res) => {
        setLogs(res.data || [])
        setTotal(res.pagination?.total ?? 0)
        setSelected(new Set()) // selections never survive a reload — ids may have moved pages
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [page, filters])

  // Debounce so typing in the search box doesn't hammer the API.
  useEffect(() => {
    const t = setTimeout(fetchLogs, filters.search ? 300 : 0)
    return () => clearTimeout(t)
  }, [fetchLogs, filters.search])

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }

  const resetFilters = () => {
    setFilters({ search: '', action: '', entityType: '', source: '', success: '', dateFrom: '', dateTo: '' })
    setPage(1)
  }

  const loadFacets = () =>
    auditApi.getFacets().then((r) => setFacets(r.data || { actions: [], entityTypes: [], sources: [] })).catch(() => {})

  const toggleRow = (id) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const pageIds = logs.map((l) => l.id)
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const toggleAllOnPage = () =>
    setSelected((s) => {
      const next = new Set(s)
      pageIds.forEach((id) => (allOnPageSelected ? next.delete(id) : next.add(id)))
      return next
    })

  // Ask the server how many rows an age-based purge would remove before showing
  // the confirmation — an admin should never approve a number we guessed.
  const askAgeConfirm = async () => {
    const days = Number(ageDays)
    if (!days || days < 1) return
    try {
      const res = await auditApi.deletePreview({ olderThanDays: days })
      setAskAge(false)
      setConfirm({ kind: 'age', olderThanDays: days, count: res.data?.count ?? 0 })
    } catch (err) {
      // The api client rejects with a plain { message, status }.
      setDeleteError(err?.message || 'Could not check how many entries match')
    }
  }

  const runDelete = async () => {
    if (!confirm) return
    setDeleting(true)
    setDeleteError('')
    try {
      await auditApi.removeMany(
        confirm.kind === 'ids' ? { ids: confirm.ids } : { olderThanDays: confirm.olderThanDays }
      )
      setConfirm(null)
      setExpanded(null)
      fetchLogs()
      loadFacets()
    } catch (err) {
      setDeleteError(err?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const controlStyle = {
    background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text-primary)',
    fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none', minHeight: 40, width: '100%',
  }

  const columns = [
    {
      // Headerless: the select-all lives in the toolbar, so on phones this
      // renders as a bare checkbox instead of a stray "Select" label per card.
      key: '__select', header: '', width: '36px',
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selected.has(row.id)}
          onChange={() => toggleRow(row.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select audit entry ${row.id}`}
          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
        />
      ),
    },
    {
      key: 'created_at', header: 'When', minWidth: '150px',
      render: (v) => <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{fmtIST(v)}</span>,
    },
    {
      key: 'actor', header: 'Customer',
      render: (a) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{a?.name || 'Unknown'}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{a?.contact || a?.id?.slice(0, 12) || '—'}</div>
        </div>
      ),
    },
    {
      key: 'action', header: 'Action',
      render: (v, row) => {
        const tone = ACTION_TONE(v)
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20,
              background: tone.bg, color: tone.fg, whiteSpace: 'nowrap',
            }}>
              {String(v).replace(/_/g, ' ')}
            </span>
            {!row.success && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-danger)' }}>FAILED</span>
            )}
          </span>
        )
      },
    },
    {
      key: 'entity', header: 'Record',
      // Some events (e.g. an admin purge) have no single target row, so only
      // show "#id" when there actually is one — never a dangling "AuditLog#".
      render: (e) => e?.type
        ? <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--color-primary-light)' }}>{e.type}{e.id ? `#${e.id}` : ''}</span>
        : <span style={{ color: 'var(--text-tertiary)' }}>—</span>,
    },
    {
      key: 'summary', header: 'What changed',
      render: (v, row) => (
        <div>
          <div style={{ fontSize: '0.8rem' }}>{v || '—'}</div>
          {row.changes?.length > 0 && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
              {row.changes.length} field{row.changes.length === 1 ? '' : 's'} changed
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions', header: '', align: 'right',
      render: (_, row) => (
        <span style={{ display: 'inline-flex', gap: 4, justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpanded(row) }}>
            Details
          </Button>
          <Button
            variant="ghost" size="sm"
            style={{ color: 'var(--color-danger)' }}
            onClick={(e) => {
              e.stopPropagation()
              setDeleteError('')
              setConfirm({ kind: 'ids', ids: [row.id], count: 1, sample: row })
            }}
          >
            Delete
          </Button>
        </span>
      ),
    },
  ]

  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle={`${total} customer action${total === 1 ? '' : 's'} recorded`}>
        {activeFilterCount > 0 && (
          <Button variant="secondary" size="sm" onClick={resetFilters}>Clear filters ({activeFilterCount})</Button>
        )}
        <Button variant="secondary" size="sm" onClick={() => { setDeleteError(''); setAskAge(true) }}>
          Delete old entries
        </Button>
      </PageHeader>

      {/* Filters — stack on phones, grid on larger screens */}
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)', padding: '14px', marginBottom: '16px',
        }}
      >
        <input
          style={controlStyle} placeholder="Search summary / record id…"
          value={filters.search} onChange={(e) => setFilter('search', e.target.value)}
        />
        <select style={controlStyle} value={filters.action} onChange={(e) => setFilter('action', e.target.value)}>
          <option value="">All actions</option>
          {facets.actions.map((a) => (
            <option key={a.value} value={a.value}>{a.value.replace(/_/g, ' ')} ({a.count})</option>
          ))}
        </select>
        <select style={controlStyle} value={filters.entityType} onChange={(e) => setFilter('entityType', e.target.value)}>
          <option value="">All records</option>
          {facets.entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select style={controlStyle} value={filters.success} onChange={(e) => setFilter('success', e.target.value)}>
          <option value="">Success &amp; failed</option>
          <option value="true">Successful only</option>
          <option value="false">Failed only</option>
        </select>
        <input
          style={controlStyle} placeholder="Customer name / email / uid"
          value={filters.actor || ''} onChange={(e) => setFilter('actor', e.target.value)}
        />
        <select style={controlStyle} value={filters.source} onChange={(e) => setFilter('source', e.target.value)}>
          <option value="">All sources</option>
          {facets.sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input style={controlStyle} type="date" value={filters.dateFrom} onChange={(e) => setFilter('dateFrom', e.target.value)} title="From (IST)" />
        <input style={controlStyle} type="date" value={filters.dateTo} onChange={(e) => setFilter('dateTo', e.target.value)} title="To (IST)" />
      </div>

      {/* Selection toolbar — select-all lives here, not in the table header, so
          the mobile card layout stays clean */}
      {logs.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-3"
          style={{
            background: selected.size ? 'rgba(239,68,68,0.08)' : 'var(--bg-card)',
            border: `1px solid ${selected.size ? 'rgba(239,68,68,0.3)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-lg)', padding: '10px 14px', marginBottom: '12px',
            transition: 'all var(--transition-fast)',
          }}
        >
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={allOnPageSelected}
              onChange={toggleAllOnPage}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
            Select all on this page
          </label>

          {selected.size > 0 && (
            <>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selected.size} selected
              </span>
              <Button
                variant="danger" size="sm"
                onClick={() => { setDeleteError(''); setConfirm({ kind: 'ids', ids: [...selected], count: selected.size }) }}
              >
                Delete selected
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
            </>
          )}
        </div>
      )}

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        pagination={{ total, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }}
        onPageChange={(offset) => setPage(Math.floor(offset / PAGE_SIZE) + 1)}
        emptyTitle="No audit entries"
        emptyDescription="Customer actions will appear here as they happen"
      />

      {/* Detail — full-width diff, scrolls within the viewport on mobile */}
      <Modal
        isOpen={!!expanded}
        onClose={() => setExpanded(null)}
        size="lg"
        title={expanded
          ? `${String(expanded.action).replace(/_/g, ' ')}${expanded.entity?.type ? ` · ${expanded.entity.type}${expanded.entity.id ? `#${expanded.entity.id}` : ''}` : ''}`
          : ''}
        footer={
          expanded && (
            <>
              <Button variant="secondary" onClick={() => setExpanded(null)}>Close</Button>
              <Button
                variant="danger"
                onClick={() => { setDeleteError(''); setConfirm({ kind: 'ids', ids: [expanded.id], count: 1, sample: expanded }) }}
              >
                Delete entry
              </Button>
            </>
          )
        }
      >
        {expanded && (
          <>
            <div style={{
              display: 'grid', gap: '4px', marginBottom: 14, paddingBottom: 12,
              borderBottom: '1px solid var(--border-default)', fontSize: '0.8rem',
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{expanded.summary || '—'}</div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                {expanded.actor?.name || 'Unknown'} ({expanded.actor?.contact || expanded.actor?.id}) · {fmtIST(expanded.created_at)} IST
                {!expanded.success && <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}> · FAILED</span>}
              </div>
            </div>
            <DiffView entry={expanded} />
          </>
        )}
      </Modal>

      {/* Age-based purge: pick a cutoff, then confirm against a real count */}
      <Modal
        isOpen={askAge}
        onClose={() => setAskAge(false)}
        size="sm"
        title="Delete old audit entries"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAskAge(false)}>Cancel</Button>
            <Button variant="danger" onClick={askAgeConfirm}>Continue</Button>
          </>
        }
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
          Remove every audit entry older than the number of days below. Newer entries are kept.
        </div>
        <input
          type="number" min="1" max="3650" value={ageDays}
          onChange={(e) => setAgeDays(e.target.value)}
          style={controlStyle}
          aria-label="Delete entries older than this many days"
        />
        {deleteError && (
          <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--color-danger)' }}>{deleteError}</div>
        )}
      </Modal>

      {/* Final confirmation — states the exact number of rows that will go */}
      <Modal
        isOpen={!!confirm}
        onClose={() => (deleting ? null : setConfirm(null))}
        size="sm"
        title="Delete audit entries?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={runDelete} disabled={deleting || confirm?.count === 0}>
              {deleting ? 'Deleting…' : `Delete ${confirm?.count ?? 0}`}
            </Button>
          </>
        }
      >
        {confirm && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'grid', gap: 10 }}>
            <div>
              {confirm.count === 0 ? (
                <>No entries match — nothing will be deleted.</>
              ) : confirm.kind === 'ids' ? (
                <>
                  <strong style={{ color: 'var(--text-primary)' }}>{confirm.count}</strong> audit
                  {confirm.count === 1 ? ' entry' : ' entries'} will be permanently deleted.
                </>
              ) : (
                <>
                  <strong style={{ color: 'var(--text-primary)' }}>{confirm.count}</strong> audit
                  {confirm.count === 1 ? ' entry' : ' entries'} older than{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{confirm.olderThanDays} days</strong> will be
                  permanently deleted.
                </>
              )}
            </div>
            {confirm.sample && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                {String(confirm.sample.action).replace(/_/g, ' ')} · {fmtIST(confirm.sample.created_at)}
              </div>
            )}
            <div style={{ fontSize: '0.78rem', color: 'var(--color-warning)' }}>
              This cannot be undone. The deletion itself is recorded as an AUDIT DELETE entry.
            </div>
            {deleteError && (
              <div style={{ fontSize: '0.78rem', color: 'var(--color-danger)' }}>{deleteError}</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
