import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import { messagesApi } from '../../api'
import { formatDate, formatDateTime } from '../../utils/formatters'

const PAGE_SIZE = 20

export default function ContactMessages() {
  const [messages, setMessages] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState(null) // message being viewed/replied

  const fetchMessages = useCallback(() => {
    setLoading(true)
    messagesApi
      .getAll({ page, limit: PAGE_SIZE })
      .then((res) => {
        setMessages(res.data || [])
        setTotal(res.pagination?.total ?? 0)
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  const handleReply = async (row) => {
    const response = window.prompt(`Reply to ${row.name || row.email || 'customer'}:\n\n"${row.message}"`, '')
    if (response === null || !response.trim()) return
    try {
      setBusy(true)
      await messagesApi.respond(row.id, { admin_response: response.trim(), status: 'resolved' })
      fetchMessages()
    } finally {
      setBusy(false)
    }
  }

  const pendingCount = messages.filter(m => m.status === 'pending').length

  const columns = [
    { key: 'id', header: '#', width: '50px', render: (val) => <span style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>#{val}</span> },
    { key: 'name', header: 'From', render: (val, row) => (
      <div><div style={{ fontWeight: 600 }}>{val || '—'}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.email || row.phone || ''}</div></div>
    )},
    { key: 'subject', header: 'Subject', render: (val, row) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{val || '(no subject)'}</div>
        {expanded === row.id && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'pre-wrap' }}>
            {row.message}
            {row.admin_response && (
              <div style={{ marginTop: '6px', padding: '8px 10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Reply</strong> ({row.responded_at ? formatDateTime(row.responded_at) : '—'}): {row.admin_response}
              </div>
            )}
          </div>
        )}
      </div>
    )},
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'created_at', header: 'Date', render: (val) => <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{formatDate(val)}</span> },
    {
      key: 'actions', header: '', align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
            {expanded === row.id ? 'Hide' : 'View'}
          </Button>
          {row.status === 'pending' && (
            <Button variant="primary" size="sm" disabled={busy} onClick={() => handleReply(row)}>Reply</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Contact Messages" subtitle={`${pendingCount} pending on this page · ${total} total`} />
      <DataTable
        columns={columns}
        data={messages}
        loading={loading}
        pagination={{ total, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }}
        onPageChange={(newOffset) => setPage(Math.floor(newOffset / PAGE_SIZE) + 1)}
        emptyTitle="No messages"
        emptyDescription="Customer contact-form messages will appear here"
      />
    </div>
  )
}
