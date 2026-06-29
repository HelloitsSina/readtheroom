import { useState } from 'react'
import { getApiKey, setApiKey, clearApiKey, maskedKey } from '../lib/apiKey.js'

export default function ApiKeySettings() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function handleUpdate() {
    const trimmed = newKey.trim()
    if (!trimmed.startsWith('sk-ant-')) {
      setError('Key should start with sk-ant-')
      return
    }
    setApiKey(trimmed)
    setNewKey('')
    setEditing(false)
    setError('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleClear() {
    clearApiKey()
    setOpen(false)
    setEditing(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(o => !o); setEditing(false); setError(''); setSaved(false) }}
        style={{
          fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.65rem',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: open ? '#00ff88' : '#555', background: 'none', border: 'none',
          cursor: 'pointer', transition: 'color 0.2s', padding: 0,
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.color = '#aaa' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = '#555' }}
      >
        API Key
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />

          {/* Panel */}
          <div style={{
            position: 'absolute', right: 0, top: '28px', zIndex: 50, width: '320px',
            background: '#111', border: '1px solid #2a2a2a', borderTop: '2px solid #00ff88',
            padding: '20px', fontFamily: 'Poppins, sans-serif', boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00ff88', marginBottom: '14px' }}>
              API Key
            </p>

            {!editing ? (
              <>
                <p style={{ fontSize: '0.8rem', color: '#888', fontFamily: 'monospace', marginBottom: '16px', wordBreak: 'break-all' }}>
                  {maskedKey() || 'No key stored'}
                </p>
                {saved && (
                  <p style={{ fontSize: '0.72rem', color: '#00ff88', marginBottom: '10px' }}>Key updated.</p>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      flex: 1, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.65rem',
                      letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 12px',
                      background: '#00ff88', color: '#0a0a0a', border: 'none', cursor: 'pointer',
                    }}
                  >
                    Update
                  </button>
                  <button
                    onClick={handleClear}
                    style={{
                      flex: 1, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.65rem',
                      letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 12px',
                      background: 'transparent', color: '#555', border: '1px solid #2a2a2a', cursor: 'pointer',
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ff8080'; e.currentTarget.style.borderColor = '#ff808044' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#2a2a2a' }}
                  >
                    Clear
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  type="password"
                  value={newKey}
                  onChange={e => { setNewKey(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                  placeholder="sk-ant-api03-..."
                  autoFocus
                  style={{
                    width: '100%', fontFamily: 'monospace', fontSize: '0.8rem',
                    color: '#bbb', background: '#0d0d0d', border: '1px solid #252525',
                    padding: '10px 12px', outline: 'none', marginBottom: '8px',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,0.35)'}
                  onBlur={e => e.target.style.borderColor = '#252525'}
                />
                {error && <p style={{ fontSize: '0.72rem', color: '#ff8080', marginBottom: '8px' }}>{error}</p>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleUpdate}
                    disabled={!newKey.trim()}
                    style={{
                      flex: 1, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.65rem',
                      letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 12px',
                      background: newKey.trim() ? '#00ff88' : '#1a1a1a',
                      color: newKey.trim() ? '#0a0a0a' : '#444',
                      border: 'none', cursor: newKey.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditing(false); setNewKey(''); setError('') }}
                    style={{
                      flex: 1, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.65rem',
                      letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 12px',
                      background: 'transparent', color: '#555', border: '1px solid #2a2a2a', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            <p style={{ fontSize: '0.65rem', color: '#333', marginTop: '14px', lineHeight: 1.5 }}>
              Stored only in your browser. Never leaves your device except to call Anthropic directly.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
