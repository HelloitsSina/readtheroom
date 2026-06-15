import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ApiKeySettings from './ApiKeySettings.jsx'

export default function Nav({ onApiKeyClear }) {
  const navigate = useNavigate()
  const [h0, setH0] = useState(false)
  const [h1, setH1] = useState(false)
  const [h2, setH2] = useState(false)

  const linkStyle = (hovered) => ({
    fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.72rem',
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: hovered ? '#00ff88' : '#aaa',
    background: 'none', border: 'none', cursor: 'pointer',
    transition: 'color 0.2s', padding: 0,
  })

  return (
    <nav style={{
      width: '100%', padding: '14px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
      fontFamily: 'Poppins, sans-serif',
    }}>
      {/* Wordmark: back to home */}
      <button
        onClick={() => navigate('/')}
        style={{
          fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.16em',
          textTransform: 'uppercase', color: '#f5f5f5',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#00ff88'}
        onMouseLeave={e => e.currentTarget.style.color = '#f5f5f5'}
      >
        READTHEROOM
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <button
          onClick={() => navigate('/library')}
          onMouseEnter={() => setH0(true)}
          onMouseLeave={() => setH0(false)}
          style={linkStyle(h0)}
        >
          Library
        </button>
        <button
          onClick={() => navigate('/persona/new')}
          onMouseEnter={() => setH1(true)}
          onMouseLeave={() => setH1(false)}
          style={linkStyle(h1)}
        >
          New Persona
        </button>
        <button
          onClick={() => navigate('/session')}
          onMouseEnter={() => setH2(true)}
          onMouseLeave={() => setH2(false)}
          style={linkStyle(h2)}
        >
          New Session
        </button>
        <ApiKeySettings onClear={onApiKeyClear || (() => {})} />
      </div>
    </nav>
  )
}
