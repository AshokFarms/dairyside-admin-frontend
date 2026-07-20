import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { contentApi } from '../../api'

export default function AppSettings() {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success' | 'error', text }

  useEffect(() => {
    let alive = true
    contentApi
      .getSettings()
      .then((res) => alive && setSettings(res.data || []))
      .catch((err) => alive && setMessage({ type: 'error', text: err.message || 'Failed to load settings' }))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  const updateSetting = (key, newValue) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newValue } : s))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)
      const payload = Object.fromEntries(settings.map(s => [s.key, s.value]))
      const res = await contentApi.updateSettings(payload)
      setSettings(res.data || settings)
      setMessage({ type: 'success', text: 'Settings saved' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading settings..." />

  return (
    <div>
      <PageHeader title="App Settings" subtitle="Configure global application settings">
        <Button variant="primary" size="md" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </PageHeader>

      {message && (
        <div style={{
          background: message.type === 'success' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '16px',
          fontSize: '0.8125rem', fontWeight: 500,
        }} role="alert">
          {message.text}
        </div>
      )}

      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)',
        overflow: 'hidden',
      }}>
        {settings.map((setting, i) => (
          <div
            key={setting.key}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            style={{ padding: '16px 20px', borderBottom: i < settings.length - 1 ? '1px solid var(--border-default)' : 'none' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                {setting.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{setting.description}</div>
            </div>
            <div className="w-full sm:w-60 sm:shrink-0">
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
