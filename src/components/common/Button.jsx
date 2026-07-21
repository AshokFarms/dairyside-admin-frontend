export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  disabled = false,
  type = 'button',
  style: customStyle = {},
  ...props
}) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--color-primary), #7c3aed)',
      color: 'white',
      border: 'none',
      hoverBg: 'linear-gradient(135deg, var(--color-primary-dark), #6d28d9)',
    },
    secondary: {
      background: 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
      hoverBg: 'var(--border-hover)',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: 'var(--color-danger)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      hoverBg: 'rgba(239, 68, 68, 0.2)',
    },
    success: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: 'var(--color-success)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      hoverBg: 'rgba(16, 185, 129, 0.2)',
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.1)',
      color: 'var(--color-warning)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      hoverBg: 'rgba(245, 158, 11, 0.2)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none',
      hoverBg: 'rgba(255,255,255,0.06)',
    },
  }

  const sizes = {
    sm: { padding: '6px 14px', fontSize: '0.75rem', gap: '6px' },
    md: { padding: '9px 18px', fontSize: '0.8125rem', gap: '8px' },
    lg: { padding: '12px 24px', fontSize: '0.875rem', gap: '10px' },
  }

  const v = variants[variant]
  const s = sizes[size]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 600,
        fontFamily: 'inherit',
        borderRadius: 'var(--radius-sm)',
        background: v.background,
        color: v.color,
        border: v.border,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--transition-fast)',
        whiteSpace: 'nowrap',
        ...customStyle,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hoverBg }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = v.background }}
      {...props}
    >
      {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
      {children}
    </button>
  )
}
