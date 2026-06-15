const ROLE_CODES = {
  manager:  '[MGR]',
  skeptic:  '[SKP]',
  finance:  '[FIN]',
  people:   '[P&C]',
  champion: '[CHP]',
  culture:  '[CCH]',
}

const ROLE_EMOJIS = {
  manager:  '🧑‍💼',
  skeptic:  '🔍',
  finance:  '📊',
  people:   '🤝',
  champion: '🎯',
  culture:  '🦘',
}

// Render text with **bold** markdown inline, preserving line breaks
function RichText({ text, style = {} }) {
  if (!text) return null
  const lines = text.split('\n')
  return (
    <div style={style}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: '6px' }} />
        // Split on **...**
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <p key={i} style={{ margin: 0, lineHeight: 1.65 }}>
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={j} style={{ color: '#f5f5f5', fontWeight: 700 }}>
                    {part.slice(2, -2)}
                  </strong>
                )
              }
              return part
            })}
          </p>
        )
      })}
    </div>
  )
}

export default function RoleCard({ role, response, onClick }) {
  const isLoading = response?.loading
  const hasText = !!response?.text
  const hasError = !!response?.error
  const code = ROLE_CODES[role.id] || '[???]'
  const emoji = role.isPersona ? role.emoji : (ROLE_EMOJIS[role.id] || role.emoji)

  return (
    <div
      onClick={hasText ? onClick : undefined}
      style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #111111 100%)',
        border: hasText ? '1px solid #222' : '1px solid #1a1a1a',
        borderLeft: hasText ? '2px solid #00ff88' : '2px solid #1a1a1a',
        boxShadow: hasText ? 'inset 0 1px 0 rgba(255,255,255,0.04), -2px 0 12px rgba(0,255,136,0.08)' : 'none',
        padding: '20px',
        cursor: hasText ? 'pointer' : 'default',
        transition: 'filter 0.15s ease',
        fontFamily: 'Poppins, sans-serif',
      }}
      onMouseEnter={e => { if (hasText) e.currentTarget.style.filter = 'brightness(1.12)' }}
      onMouseLeave={e => { if (hasText) e.currentTarget.style.filter = 'brightness(1)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="role-icon">
            <span style={{ fontSize: '15px', lineHeight: 1 }}>{emoji}</span>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#f5f5f5', lineHeight: 1.2 }}>{role.title}</p>
            <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px' }}>{role.descriptor}</p>
          </div>
        </div>
        <span className="role-code">{code}</span>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
          <span className="dot-green" />
          <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555' }}>reading...</span>
        </div>
      )}

      {/* Response — render bold labels */}
      {hasText && (
        <RichText
          text={response.text}
          style={{ fontSize: '0.875rem', color: '#888', overflow: 'hidden', maxHeight: '140px' }}
        />
      )}

      {/* Error: key errors shown as top-level banner, not per-card */}
      {hasError && response.error !== 'INVALID_API_KEY' && response.error !== 'NO_API_KEY' && (
        <p style={{ fontSize: '0.75rem', color: '#ff8080', marginTop: '8px' }}>{response.error}</p>
      )}

      {/* CTA */}
      {hasText && (
        <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00ff88', marginTop: '14px' }}>
          &#8627; Go deeper
        </p>
      )}
    </div>
  )
}
