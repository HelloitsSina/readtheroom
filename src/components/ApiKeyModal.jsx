import { useState, useEffect, useRef } from 'react'
import { setApiKey } from '../lib/apiKey.js'

export default function ApiKeyModal({ onSave, onClose }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSave() {
    const trimmed = key.trim()
    if (!trimmed.startsWith('sk-ant-')) {
      setError('That does not look like an Anthropic key. It should start with sk-ant-')
      return
    }
    setSaving(true)
    setApiKey(trimmed)
    setTimeout(() => { setSaving(false); onSave() }, 200)
  }

  const active = key.trim().length > 0

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d0d0d', border: '1px solid #1a1a1a',
          borderTop: '2px solid #00ff88',
          width: '100%', maxWidth: '460px',
          padding: '32px', fontFamily: 'Poppins, sans-serif',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#444', fontSize: '0.9rem', lineHeight: 1,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
          onMouseLeave={e => e.currentTarget.style.color = '#444'}
          aria-label="Close"
        >
          &#10005;
        </button>

        {/* Heading */}
        <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f5f5f5', marginBottom: '10px', paddingRight: '24px', lineHeight: 1.3 }}>
          You need an Anthropic API key to run this
        </h2>

        {/* Explanation */}
        <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.65, marginBottom: '8px' }}>
          ReadTheRoom runs entirely in your browser. Your key is stored locally and never shared.
        </p>

        {/* Link */}
        <p style={{ fontSize: '0.78rem', marginBottom: '24px' }}>
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#00ff88', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Get your key at console.anthropic.com
          </a>
        </p>

        {/* Input */}
        <input
          ref={inputRef}
          type="password"
          value={key}
          onChange={e => { setKey(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="sk-ant-api03-..."
          style={{
            width: '100%', fontFamily: 'monospace', fontSize: '0.875rem',
            color: '#bbb', background: '#141414', border: '1px solid #252525',
            padding: '12px 14px', outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            marginBottom: '8px', boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(0,255,136,0.35)'; e.target.style.boxShadow = '0 0 16px rgba(0,255,136,0.08)' }}
          onBlur={e => { e.target.style.borderColor = '#252525'; e.target.style.boxShadow = 'none' }}
        />

        {/* Error */}
        {error && (
          <p style={{ fontSize: '0.75rem', color: '#ff8080', marginBottom: '8px' }}>{error}</p>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!active || saving}
          style={{
            width: '100%', fontFamily: 'Poppins, sans-serif', fontWeight: 700,
            fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '13px', marginTop: '8px',
            background: active ? '#00ff88' : '#1a1a1a',
            color: active ? '#0a0a0a' : '#444',
            border: 'none', cursor: active ? 'pointer' : 'not-allowed',
            boxShadow: active ? '0 0 20px rgba(0,255,136,0.3)' : 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (active) e.currentTarget.style.boxShadow = '0 0 32px rgba(0,255,136,0.55)' }}
          onMouseLeave={e => { if (active) e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,136,0.3)' }}
        >
          {saving ? 'Saving...' : 'Save and Continue'}
        </button>
      </div>
    </div>
  )
}
