import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

// Responsive data table:
//   • md and up  → a normal table inside a horizontal-scroll box (columns never crush)
//   • below md   → each row becomes a stacked card (label → value per column)
// Same props/data as before — the mobile presentation is derived automatically
// from the column defs. Columns with an empty `header` (e.g. an actions column)
// render full-width with no label on mobile.
export default function DataTable({
  columns,
  data,
  loading = false,
  emptyTitle = 'No data found',
  emptyDescription = '',
  onRowClick,
  pagination,
  onPageChange,
}) {
  const renderCell = (col, row, rowIndex) =>
    col.render ? col.render(row[col.key], row, rowIndex) : row[col.key] ?? '—'

  const pageBtn = (disabled) => ({
    minHeight: 40,
    padding: '8px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-default)',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    fontSize: '0.8125rem',
    fontFamily: 'inherit',
    transition: 'all var(--transition-fast)',
  })

  return (
    <div
      className="animate-fadeIn"
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
      }}
    >
      {loading ? (
        <LoadingSpinner text="Loading data..." />
      ) : !data || data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          {/* Tablet / desktop: scrollable table */}
          <div className="hidden md:block" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col, i) => (
                    <th key={i} style={{ width: col.width, minWidth: col.minWidth, textAlign: col.align || 'left' }}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    onClick={() => onRowClick?.(row)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default', animationDelay: `${rowIndex * 30}ms` }}
                    className="animate-fadeIn"
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} style={{ textAlign: col.align || 'left' }}>
                        {renderCell(col, row, rowIndex)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phones: stacked cards */}
          <div className="md:hidden">
            {data.map((row, rowIndex) => (
              <div
                key={row.id || rowIndex}
                onClick={() => onRowClick?.(row)}
                className="animate-fadeIn"
                style={{
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  padding: '14px 16px', borderBottom: '1px solid var(--border-default)',
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
              >
                {columns.map((col, i) => {
                  const hasLabel = col.header && String(col.header).trim() !== ''
                  const content = renderCell(col, row, rowIndex)
                  if (!hasLabel) {
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
                        {content}
                      </div>
                    )
                  }
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                        {col.header}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'right', minWidth: 0 }}>
                        {content}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && (
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '10px', padding: '12px 16px',
                borderTop: '1px solid var(--border-default)', fontSize: '0.8125rem', color: 'var(--text-secondary)',
              }}
            >
              <span>
                Showing {pagination.offset + 1}–{Math.min(pagination.offset + data.length, pagination.total)} of {pagination.total}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onPageChange?.(Math.max(0, pagination.offset - pagination.limit))}
                  disabled={pagination.offset === 0}
                  style={pageBtn(pagination.offset === 0)}
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange?.(pagination.offset + pagination.limit)}
                  disabled={pagination.offset + data.length >= pagination.total}
                  style={pageBtn(pagination.offset + data.length >= pagination.total)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
