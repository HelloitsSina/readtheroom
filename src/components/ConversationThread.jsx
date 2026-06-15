import { useState, useRef, useEffect } from 'react'

// Render **bold** markdown inline with line breaks
function RichText({ text }) {
  if (!text) return null
  return (
    <>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: '6px' }} />
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <p key={i} style={{ margin: 0, lineHeight: 1.65 }}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} style={{ color: '#e0e0e0', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        )
      })}
    </>
  )
}

const ROLE_CODES = {
  manager: '[MGR]', skeptic: '[SKP]', finance: '[FIN]',
  people: '[P&C]', champion: '[CHP]', culture: '[CCH]',
}

export default function ConversationThread({
  role, initialResponse, onSend, onBack, onSwitchRole, allRoles, responses
}) {
  const [messages, setMessages] = useState([{ from: 'persona', text: initialResponse }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    setMessages([{ from: 'persona', text: initialResponse }])
    setInput(''); setError(null)
  }, [role.id, initialResponse])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    const newMessages = [...messages, { from: 'user', text }]
    setMessages(newMessages); setInput(''); setLoading(true); setError(null)
    const history = newMessages.map(m => ({ role: m.from === 'persona' ? 'assistant' : 'user', content: m.text }))
    try {
      const reply = await onSend(text, history.slice(0, -1))
      setMessages(prev => [...prev, { from: 'persona', text: reply }])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const code = ROLE_CODES[role.id] || '[???]'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '720px', margin: '0 auto', width: '100%', padding: '32px 24px', fontFamily: 'Poppins, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #1a1a1a', paddingBottom: '16px', marginBottom: '24px' }}>
        <button onClick={onBack} className="btn-ghost" style={{ fontSize: '0.75rem' }}>
          &larr; Room
        </button>
        <div style={{ width: '1px', height: '16px', background: '#2a2a2a' }} />
        <span style={{ fontSize: '1.25rem' }}>{role.emoji}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f5f5f5', lineHeight: 1 }}>{role.title}</p>
          <p style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555', marginTop: '3px' }}>{role.descriptor}</p>
        </div>
        <span className="role-code">{code}</span>
      </div>

      {/* Role switcher chips */}
      {allRoles && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          {allRoles.map(r => {
            const hasResponse = !!responses?.[r.id]?.text
            const isActive = r.id === role.id
            const rCode = ROLE_CODES[r.id] || '[???]'
            return (
              <button
                key={r.id}
                disabled={!hasResponse}
                onClick={() => hasResponse && !isActive && onSwitchRole(r)}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  background: 'transparent',
                  border: isActive ? '1px solid #00ff88' : '1px solid #222',
                  color: isActive ? '#00ff88' : hasResponse ? '#888' : '#333',
                  cursor: hasResponse && !isActive ? 'pointer' : 'default',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 0 10px rgba(0,255,136,0.15)' : 'none',
                  transition: 'all 0.15s ease',
                  opacity: !hasResponse ? 0.4 : 1,
                }}
              >
                {rCode}
              </button>
            )
          })}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px', overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.from === 'persona' && (
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.65rem', color: '#00ff88', marginRight: '10px', marginTop: '14px', flexShrink: 0, letterSpacing: '0.04em' }}>{code}</span>
            )}
            <div style={{
              maxWidth: '80%',
              padding: '14px 18px',
              fontSize: '0.875rem',
              lineHeight: 1.65,
              fontFamily: 'Poppins, sans-serif',
              ...(msg.from === 'user'
                ? { background: '#f5f5f5', color: '#0a0a0a', borderRadius: 0 }
                : { background: '#111', border: '1px solid #222', borderLeft: '2px solid #00ff88', color: '#888', borderRadius: 0 }
              )
            }}>
              {msg.from === 'persona' ? <RichText text={msg.text} /> : msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.65rem', color: '#00ff88', marginTop: '14px', letterSpacing: '0.04em' }}>{code}</span>
            <div style={{ padding: '14px 18px', background: '#111', border: '1px solid #222', borderLeft: '2px solid #00ff88', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="dot-green" />
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555' }}>reading...</span>
            </div>
          </div>
        )}

        {error && <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: '#00ff88', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder={`Reply to ${role.title}...`} disabled={loading}
          className="field-input"
          style={{ flex: 1, opacity: loading ? 0.4 : 1 }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary"
          style={{ padding: '12px 24px', flexShrink: 0 }}
        >
          Send
        </button>
      </form>
    </div>
  )
}
