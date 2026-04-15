import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'

const mockSettings = [
  { key: 'free_delivery_threshold', value: '200', description: 'Minimum order amount for free delivery (₹)', type: 'number' },
  { key: 'delivery_fee', value: '20', description: 'Default delivery fee (₹)', type: 'number' },
  { key: 'gst_percentage', value: '5', description: 'GST percentage applied to orders', type: 'number' },
  { key: 'max_wallet_balance', value: '5000', description: 'Maximum wallet balance a user can hold (₹)', type: 'number' },
  { key: 'referral_bonus', value: '50', description: 'Referral bonus amount (₹)', type: 'number' },
  { key: 'trial_refund_days', value: '7', description: 'Days within which trial refunds are processed', type: 'number' },
  { key: 'support_email', value: 'support@dairyside.in', description: 'Customer support email', type: 'text' },
  { key: 'support_phone', value: '+91 9876543210', description: 'Customer support phone', type: 'text' },
  { key: 'order_prefix', value: 'SWD', description: 'Order number prefix', type: 'text' },
  { key: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode (disables ordering)', type: 'boolean' },
]

export default function AppSettings() {
  const [settings, setSettings] = useState(mockSettings)

  const updateSetting = (key, newValue) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newValue } : s))
  }

  return (
    <div>
      <PageHeader title="App Settings" subtitle="Configure global application settings">
        <Button variant="primary" size="md">Save Changes</Button>
      </PageHeader>

      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)',
        overflow: 'hidden',
      }}>
        {settings.map((setting, i) => (
          <div key={setting.key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
            padding: '18px 24px', borderBottom: i < settings.length - 1 ? '1px solid var(--border-default)' : 'none',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                {setting.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{setting.description}</div>
            </div>
            <div style={{ width: '240px', flexShrink: 0 }}>
              {setting.type === 'boolean' ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div
                    onClick={() => updateSetting(setting.key, setting.value === 'true' ? 'false' : 'true')}
                    style={{
                      width: 44, height: 24, borderRadius: '12px', padding: '2px', cursor: 'pointer',
                      background: setting.value === 'true' ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                      transition: 'all var(--transition-fast)', position: 'relative',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', background: 'white',
                      transform: setting.value === 'true' ? 'translateX(20px)' : 'translateX(0)',
                      transition: 'transform var(--transition-fast)',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {setting.value === 'true' ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              ) : (
                <input
                  type={setting.type}
                  value={setting.value}
                  onChange={e => updateSetting(setting.key, e.target.value)}
                  style={{
                    width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text-primary)',
                    fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none',
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
