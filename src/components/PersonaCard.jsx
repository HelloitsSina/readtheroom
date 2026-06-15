export default function PersonaCard({ persona, onClick, onDelete }) {
  const updated = new Date(persona.updatedAt).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div
      onClick={onClick}
      style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #111111 100%)',
        border: '1px solid #222',
        borderTop: '2px solid #00ff88',
        cursor: 'pointer',
        transition: 'filter 0.15s ease',
        fontFamily: 'Poppins, sans-serif',
      }}
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.querySelector('.delete-btn').style.opacity = '1' }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.querySelector('.delete-btn').style.opacity = '0' }}
    >
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f5f5f5', lineHeight: 1.2 }}>{persona.name}</h3>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginTop: '4px' }}>{persona.role}</p>
          </div>
          <button
            className="delete-btn"
            onClick={e => { e.stopPropagation(); onDelete() }}
            style={{ opacity: 0, fontSize: '0.7rem', color: '#555', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#00ff88'}
            onMouseLeave={e => e.target.style.color = '#555'}
          >
            &#10005;
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {persona.priorities?.filter(Boolean).slice(0, 3).map((p, i) => (
            <span key={i} className="tag">{p}</span>
          ))}
        </div>

        <p style={{ fontSize: '0.7rem', fontWeight: 400, color: '#666' }}>
          Updated {updated}
        </p>
      </div>
    </div>
  )
}
