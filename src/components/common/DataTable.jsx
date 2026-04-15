import { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

export default function DataTable({
  columns,
  data,
  loading = false,
  emptyTitle = 'No data found',
  emptyDescription = '',
  onRowClick,
  pagination,
  onPageChange,
  stickyHeader = true,
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
      }}
      className="animate-fadeIn"
    >
      {loading ? (
        <LoadingSpinner text="Loading data..." />
      ) : !data || data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
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
                    style={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      animationDelay: `${rowIndex * 30}ms`,
                    }}
                    className="animate-fadeIn"
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} style={{ textAlign: col.align || 'left' }}>
                        {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderTop: '1px solid var(--border-default)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span>
                Showing {pagination.offset + 1}–{Math.min(pagination.offset + data.length, pagination.total)} of {pagination.total}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => onPageChange?.(Math.max(0, pagination.offset - pagination.limit))}
                  disabled={pagination.offset === 0}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    cursor: pagination.offset === 0 ? 'not-allowed' : 'pointer',
                    opacity: pagination.offset === 0 ? 0.4 : 1,
                    fontSize: '0.8125rem',
                    fontFamily: 'inherit',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange?.(pagination.offset + pagination.limit)}
                  disabled={pagination.offset + data.length >= pagination.total}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    cursor: pagination.offset + data.length >= pagination.total ? 'not-allowed' : 'pointer',
                    opacity: pagination.offset + data.length >= pagination.total ? 0.4 : 1,
                    fontSize: '0.8125rem',
                    fontFamily: 'inherit',
                    transition: 'all var(--transition-fast)',
                  }}
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
