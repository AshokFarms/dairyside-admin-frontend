import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import TableScroll from '../../components/ui/TableScroll'
import { deliveriesApi } from '../../api'
import { formatDate } from '../../utils/formatters'



function formatTotalVolume(d) {
  const qty = Number(d.quantity) || 1;
  const itemsText = d.items || '';
  
  let productName = d.product_name || '';
  let sizeLabel = d.size_label || '';
  
  if (!sizeLabel && itemsText) {
    const match = itemsText.match(/^(.+?)\s+(\d+(?:\.\d+)?\s*(?:ml|l|liter|liters|gm|g|kg|kgs|pcs|packet|packets|unit|units))$/i);
    if (match) {
      productName = match[1];
      sizeLabel = match[2];
    } else {
      productName = itemsText;
    }
  }

  let totalVolStr = '';
  const sizeMatch = (sizeLabel || '').match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
  if (sizeMatch) {
    const sizeVal = parseFloat(sizeMatch[1]);
    const unit = sizeMatch[2].toLowerCase();
    
    if (unit === 'ml') {
      const totalMl = sizeVal * qty;
      if (totalMl >= 1000) {
        const litres = (totalMl / 1000).toFixed(1).replace(/\.0$/, '');
        totalVolStr = litres === '1' ? '1 Liter' : `${litres} Liters`;
      } else {
        totalVolStr = `${totalMl} ml`;
      }
    } else if (unit === 'l' || unit === 'liter' || unit === 'liters') {
      const totalL = (sizeVal * qty).toFixed(1).replace(/\.0$/, '');
      totalVolStr = totalL === '1' ? '1 Liter' : `${totalL} Liters`;
    } else if (unit === 'gm' || unit === 'g') {
      const totalGm = sizeVal * qty;
      if (totalGm >= 1000) {
        const kgs = (totalGm / 1000).toFixed(1).replace(/\.0$/, '');
        totalVolStr = `${kgs} kg`;
      } else {
        totalVolStr = `${totalGm} g`;
      }
    } else if (unit === 'kg' || unit === 'kgs') {
      const totalKg = (sizeVal * qty).toFixed(1).replace(/\.0$/, '');
      totalVolStr = `${totalKg} kg`;
    }
  }

  if (totalVolStr) {
    return { vol: totalVolStr, name: productName };
  }

  return { vol: `${qty} ×`, name: itemsText };
}

export default function DeliveryManifest() {
  const [shiftFilter, setShiftFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [deliveries, setDeliveries] = useState([])
  const [summary, setSummary] = useState({ total: 0, pending: 0, delivered: 0, morning: 0, evening: 0 })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const fetchManifest = useCallback(() => {
    setLoading(true)
    deliveriesApi
      .getToday()
      .then((res) => {
        setDeliveries(res.data?.deliveries || [])
        setSummary(res.data?.summary || { total: 0, pending: 0, delivered: 0, morning: 0, evening: 0 })
        setSelectedIds(new Set())
      })
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchManifest() }, [fetchManifest])

  const filtered = deliveries.filter(d => shiftFilter === 'all' || d.shift === shiftFilter)

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const completeOne = async (orderId) => {
    try {
      setBusy(true)
      await deliveriesApi.complete(orderId)
      fetchManifest()
    } finally {
      setBusy(false)
    }
  }

  const completeSelected = async () => {
    try {
      setBusy(true)
      await deliveriesApi.bulkComplete({ ids: Array.from(selectedIds) })
      fetchManifest()
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading today's deliveries..." />

  return (
    <div>
      <PageHeader title="Today's Deliveries" subtitle={`${formatDate(new Date().toISOString())} · ${summary.total} deliveries`}>
        {selectedIds.size > 0 && (
          <Button variant="success" size="md" disabled={busy} onClick={completeSelected}>
            {busy ? 'Updating…' : `Mark ${selectedIds.size} as Delivered`}
          </Button>
        )}
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" style={{ marginBottom: '20px' }}>
        {[
          { label: 'Total', value: summary.total, color: 'var(--text-primary)' },
          { label: 'Pending', value: summary.pending, color: 'var(--color-warning)' },
          { label: 'Delivered', value: summary.delivered, color: 'var(--color-success)' },
          { label: 'Morning', value: summary.morning, color: '#fbbf24' },
          { label: 'Evening', value: summary.evening, color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            padding: '14px 20px', textAlign: 'center', flex: 1,
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Shift Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--border-default)', width: 'fit-content', maxWidth: '100%', overflowX: 'auto' }}>
        {['all', 'morning', 'evening'].map(tab => {
          let label = 'All';
          let count = summary.total;
          if (tab === 'morning') {
            label = '☀ Morning';
            count = summary.morning;
          } else if (tab === 'evening') {
            label = '🌙 Evening';
            count = summary.evening;
          }
          return (
            <button key={tab} onClick={() => setShiftFilter(tab)}
              style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: shiftFilter === tab ? 'var(--color-primary)' : 'transparent', color: shiftFilter === tab ? 'white' : 'var(--text-secondary)', textTransform: 'capitalize' }}>
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Delivery List */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
        <TableScroll minWidth={720}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Address</th>
                <th>Pincode</th>
                <th>Shift</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const isSelectable = d.status !== 'delivered' && d.status !== 'cancelled';
                const isSelected = selectedIds.has(d.id);
                return (
                  <tr
                    key={d.id}
                    onClick={(e) => {
                      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.closest('button')) {
                        return;
                      }
                      if (isSelectable) {
                        toggleSelect(d.id);
                      }
                    }}
                    style={{ cursor: isSelectable ? 'pointer' : 'default' }}
                  >
                    <td>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(d.id)}
                        style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                        disabled={!isSelectable}
                      />
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-light)' }}>{d.order_number}</td>
                    <td style={{ fontWeight: 600 }}>{d.customer}</td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {(() => {
                        const { vol, name } = formatTotalVolume(d);
                        return (
                          <span>
                            <strong style={{ color: 'var(--color-primary-light)', fontWeight: 700 }}>
                              {vol}
                            </strong>
                            {name ? <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>{name}</span> : null}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.address || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{d.pincode || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 600 }}>
                          {d.shift === 'morning' ? '☀' : '🌙'} {d.shift}
                        </span>
                        {d.delivery_slot && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2.5px', whiteSpace: 'nowrap' }}>
                            ⏰ {d.delivery_slot}
                          </span>
                        )}
                      </div>
                    </td>
                    <td><StatusBadge status={d.status} size="sm" /></td>
                    <td>
                      {isSelectable && (
                        <Button variant="success" size="sm" disabled={busy} onClick={() => completeOne(d.id)}>✓ Complete</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableScroll>
        {filtered.length === 0 && (
          <EmptyState title="No deliveries" description="Nothing scheduled for this shift today" />
        )}
      </div>
    </div>
  )
}
