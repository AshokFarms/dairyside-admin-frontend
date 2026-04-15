import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import { formatDate } from '../../utils/formatters'

const mockMessages = Array.from({ length: 10 }, (_, i) => {
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Devi', 'Vikram Patel']
  const subjects = ['Delivery was late', 'Wrong product delivered', 'Subscription cancellation issue', 'Payment not reflected', 'Need to change address']
  return {
    id: i + 1,
    name: names[i % names.length],
    email: `${names[i % names.length].toLowerCase().replace(/ /g, '.')}@email.com`,
    subject: subjects[i % subjects.length],
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Need assistance regarding my recent order.',
    status: i < 4 ? 'pending' : 'resolved',
    created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  }
})

export default function ContactMessages() {
  const columns = [
    { key: 'id', header: '#', width: '50px', render: (val) => <span style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>#{val}</span> },
    { key: 'name', header: 'From', render: (val, row) => (
      <div><div style={{ fontWeight: 600 }}>{val}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.email}</div></div>
    )},
    { key: 'subject', header: 'Subject', render: (val) => <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{val}</span> },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'created_at', header: 'Date', render: (val) => <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{formatDate(val)}</span> },
    { key: 'actions', header: '', align: 'right', render: (_, row) => row.status === 'pending' ? <Button variant="primary" size="sm">Reply</Button> : <Button variant="ghost" size="sm">View</Button> },
  ]

  return (
    <div>
      <PageHeader title="Contact Messages" subtitle={`${mockMessages.filter(m => m.status === 'pending').length} pending messages`} />
      <DataTable columns={columns} data={mockMessages} emptyTitle="No messages" />
    </div>
  )
}
