import { useState } from 'react'
import { setApiKey } from '../lib/apiKey.js'

export default function ApiKeyGate({ onSave }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleSave() {
    const trimmed = key.trim()
    if (!trimmed.startsWith('sk-ant-')) {
      setError('That does not look like an Anthropic key. It should start with sk-ant-')
      return
    }
    setSaving(true)
    setApiKey(trimmed)
    setTimeout(() => { setSaving(false); onSave() }, 300)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Logo */}
        <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: '48px' }}>
          READTHEROOM
        </p>

        {/* Heading */}
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f5f5f5', lineHeight: 1.2, marginBottom: '16px' }}>
          Enter your Anthropic API key
        </h1>

        {/* Explanation */}
        <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.7, marginBottom: '32px' }}>
          ReadTheRoom runs entirely in your browser. Your key is stored locally on your device
          and never sent anywhere except directly to Anthropic.
        </p>

        {/* Input */}
        <div style={{ marginBottom: '12px' }}>
          <input
            type="password"
            value={key}
            onChange={e => { setKey(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="sk-ant-api03-..."
            autoFocus
            style={{
              width: '100%', fontFamily: 'Poppins, monospace', fontSize: '0.875rem',
              color: '#bbb', background: '#141414', border: '1px solid #252525',
              padding: '14px 16px', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(0,255,136,0.35)'; e.target.style.boxShadow = '0 0 20px rgba(0,255,136,0.09)' }}
            onBlur={e => { e.target.style.borderColor = '#252525'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Error */}
        {error && (
          <p style={{ fontSize: '0.78rem', color: '#ff8080', marginBottom: '12px' }}>{error}</p>
        )}

        {/* Get key link */}
        <p style={{ fontSize: '0.78rem', color: '#555', marginBottom: '28px' }}>
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#00ff88', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.opacity = '0.75'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Get your API key at console.anthropic.com
          </a>
        </p>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!key.trim() || saving}
          style={{
            width: '100%', fontFamily: 'Poppins, sans-serif', fontWeight: 700,
            fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '15px', background: key.trim() ? '#00ff88' : '#1a1a1a',
            color: key.trim() ? '#0a0a0a' : '#444', border: 'none',
            cursor: key.trim() ? 'pointer' : 'not-allowed',
            boxShadow: key.trim() ? '0 0 24px rgba(0,255,136,0.35)' : 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (key.trim()) e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,136,0.6)' }}
          onMouseLeave={e => { if (key.trim()) e.currentTarget.style.boxShadow = '0 0 24px rgba(0,255,136,0.35)' }}
        >
          {saving ? 'Saving...' : 'Save and Continue'}
        </button>

        {/* Privacy note */}
        <p style={{ fontSize: '0.7rem', color: '#333', marginTop: '24px', lineHeight: 1.6 }}>
          Your key is saved only in your browser's localStorage. Clearing your browser data will remove it.
          This app has no backend that touches your key.
        </p>
      </div>
    </div>
  )
}
