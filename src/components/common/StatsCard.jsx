export default function StatsCard({ title, value, change, changeType = 'increase', icon, color = 'var(--color-primary)', subtitle }) {
  const isPositive = changeType === 'increase'

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px 24px',
        border: '1px solid var(--border-default)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all var(--transition-fast)',
        cursor: 'default',
      }}
      className="animate-fadeIn"
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.boxShadow = `0 0 20px ${color}15`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-default)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Subtle gradient glow */}
      <div style={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}12, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          letterSpacing: '0.01em',
        }}>
          {title}
        </span>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}>
          {icon}
        </div>
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '6px' }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {change !== undefined && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: isPositive ? 'var(--color-success)' : 'var(--color-danger)',
            background: isPositive ? 'var(--color-success-light)' : 'var(--color-danger-light)',
            padding: '2px 8px',
            borderRadius: '20px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: isPositive ? 'none' : 'rotate(180deg)' }}>
              <polyline points="18 15 12 9 6 15" />
            </svg>
            {change}%
          </span>
        )}
        {subtitle && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{subtitle}</span>
        )}
      </div>
    </div>
  )
}
