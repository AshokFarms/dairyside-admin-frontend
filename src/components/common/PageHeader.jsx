export default function PageHeader({ title, subtitle, actions, children }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap',
      }}
      className="animate-slideUp"
    >
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          margin: 0,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-tertiary)',
            marginTop: '4px',
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {(actions || children) && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {actions || children}
        </div>
      )}
    </div>
  )
}
