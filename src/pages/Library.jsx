import { useState, useEffect, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPersonas, deletePersona } from '../lib/storage.js'
import { getSessions, deleteSession } from '../lib/sessions.js'
import PersonaCard from '../components/PersonaCard.jsx'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

export default function Library({ onApiKeyClear }) {
  const [tab, setTab] = useState('personas')
  const [personas, setPersonas] = useState([])
  const [sessions, setSessions] = useState([])
  const [expandedSession, setExpandedSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setPersonas(getPersonas())
    setSessions(getSessions())
  }, [])

  function handleDeletePersona(id) {
    deletePersona(id)
    setPersonas(getPersonas())
  }

  function handleDeleteSession(id) {
    deleteSession(id)
    setSessions(getSessions())
    if (expandedSession === id) setExpandedSession(null)
  }

  const tabStyle = (active) => ({
    fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.75rem',
    letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 0',
    background: 'none', border: 'none', cursor: 'pointer',
    color: active ? '#f5f5f5' : '#555',
    borderBottom: active ? '2px solid #00ff88' : '2px solid transparent',
    transition: 'all 0.2s',
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Nav onApiKeyClear={onApiKeyClear} />
      <div style={{ flex: 1, padding: '48px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <p className="label" style={{ marginBottom: '8px' }}>&#9632; Library</p>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#f5f5f5' }}>
              Your Library
            </h2>
          </div>
          {tab === 'personas' && (
            <button onClick={() => navigate('/persona/new')} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '8px 18px' }}>
              + New Persona
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '28px', borderBottom: '1px solid #1a1a1a', marginBottom: '32px' }}>
          <button style={tabStyle(tab === 'personas')} onClick={() => setTab('personas')}>
            Personas {personas.length > 0 && <span style={{ color: '#00ff88', marginLeft: '4px' }}>{personas.length}</span>}
          </button>
          <button style={tabStyle(tab === 'sessions')} onClick={() => setTab('sessions')}>
            Session History {sessions.length > 0 && <span style={{ color: '#00ff88', marginLeft: '4px' }}>{sessions.length}</span>}
          </button>
        </div>

        {/* Personas tab */}
        {tab === 'personas' && (
          personas.length === 0 ? (
            <EmptyState
              icon="[ ]"
              title="No personas yet"
              sub="Add your first persona to get started"
              action="+ Add Persona"
              onAction={() => navigate('/persona/new')}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {personas.map(persona => (
                <PersonaCard
                  key={persona.id} persona={persona}
                  onClick={() => navigate(`/persona/${persona.id}`)}
                  onDelete={() => handleDeletePersona(persona.id)}
                />
              ))}
            </div>
          )
        )}

        {/* Sessions tab */}
        {tab === 'sessions' && (
          sessions.length === 0 ? (
            <EmptyState
              icon="[ ]"
              title="No sessions yet"
              sub="Run a prep session to see your history here"
              action="New Session →"
              onAction={() => navigate('/session')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  expanded={expandedSession === session.id}
                  onToggle={() => setExpandedSession(prev => prev === session.id ? null : session.id)}
                  onDelete={() => handleDeleteSession(session.id)}
                />
              ))}
            </div>
          )
        )}
      </div>
      <Footer />
    </div>
  )
}

// Render **bold** markdown inline
function RichText({ text }) {
  if (!text) return null
  return (
    <>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: '4px' }} />
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <p key={i} style={{ margin: 0, lineHeight: 1.65 }}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} style={{ color: '#d0d0d0', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        )
      })}
    </>
  )
}

function SessionCard({ session, expanded, onToggle, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const date = new Date(session.createdAt).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const responseCount = Object.keys(session.initialResponses || {}).length
  const convoCount = Object.keys(session.conversations || {}).length

  return (
    <div style={{
      background: expanded ? '#111' : '#0d0d0d',
      border: expanded ? '1px solid #2a2a2a' : '1px solid #1a1a1a',
      borderLeft: expanded ? '2px solid #00ff88' : '2px solid #1a1a1a',
      fontFamily: 'Poppins, sans-serif',
      transition: 'all 0.2s',
    }}>
      {/* Header row */}
      <div
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', cursor: 'pointer',
          background: hovered && !expanded ? 'rgba(255,255,255,0.02)' : 'transparent',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#00ff88', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', padding: '3px 8px', flexShrink: 0 }}>
            {session.scenarioType}
          </span>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {session.content?.slice(0, 80)}{session.content?.length > 80 ? '...' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, marginLeft: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '0.65rem', color: '#555' }}>{session.participants?.length || 0} participants</span>
            {responseCount > 0 && <span style={{ fontSize: '0.65rem', color: '#555' }}>{responseCount} responses</span>}
            {convoCount > 0 && <span style={{ fontSize: '0.65rem', color: '#00ff88' }}>{convoCount} conversation{convoCount !== 1 ? 's' : ''}</span>}
          </div>
          <span style={{ fontSize: '0.65rem', color: '#444' }}>{date}</span>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            style={{ fontSize: '0.7rem', color: '#333', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#ff4444'}
            onMouseLeave={e => e.target.style.color = '#333'}
          >&#10005;</button>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: expanded ? '#00ff88' : hovered ? '#aaa' : '#555',
            userSelect: 'none', transition: 'color 0.2s',
          }}>
            {expanded ? 'Close ▲' : 'View ▼'}
          </span>
        </div>
      </div>

      {/* Expanded: conversations */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1a1a1a', padding: '0 20px 24px' }}>

          {/* Full proposal input */}
          {session.content && (
            <div style={{ marginTop: '18px', marginBottom: '4px' }}>
              <p className="label" style={{ marginBottom: '10px' }}>Your Input</p>
              <div style={{
                background: '#0a0a0a', border: '1px solid #1e1e1e',
                padding: '14px 16px', fontFamily: 'Poppins, sans-serif',
                fontSize: '0.85rem', color: '#888', lineHeight: 1.7, whiteSpace: 'pre-wrap',
              }}>
                {session.content}
              </div>
            </div>
          )}

          {/* Initial responses grid */}
          {responseCount > 0 && (
            <div style={{ marginTop: '20px' }}>
              <p className="label" style={{ marginBottom: '12px' }}>Initial Responses</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                {Object.entries(session.initialResponses || {}).map(([roleId, text]) => {
                  const participant = session.participants?.find(p => p.id === roleId)
                  return (
                    <div key={roleId} style={{ background: '#111', border: '1px solid #1e1e1e', borderLeft: '2px solid #00ff88', padding: '12px 14px' }}>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00ff88', marginBottom: '6px' }}>
                        {participant?.title || roleId}
                      </p>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}><RichText text={text} /></div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Conversations */}
          {Object.entries(session.conversations || {}).map(([roleId, messages]) => {
            const participant = session.participants?.find(p => p.id === roleId)
            return (
              <div key={roleId} style={{ marginTop: '20px' }}>
                <p className="label" style={{ marginBottom: '10px' }}>
                  Conversation with {participant?.title || roleId}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '75%', padding: '10px 14px', fontSize: '0.8rem', lineHeight: 1.6,
                        fontFamily: 'Poppins, sans-serif',
                        ...(msg.role === 'user'
                          ? { background: '#f5f5f5', color: '#0a0a0a' }
                          : { background: '#111', border: '1px solid #1e1e1e', borderLeft: '2px solid #00ff88', color: '#888' }
                        )
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {convoCount === 0 && responseCount > 0 && (
            <p style={{ fontSize: '0.75rem', color: '#444', marginTop: '16px', fontFamily: 'Poppins, sans-serif' }}>
              No conversations started in this session.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, title, sub, action, onAction }) {
  return (
    <div style={{ marginTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: '#222', marginBottom: '20px' }}>{icon}</p>
      <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f5f5f5', marginBottom: '8px' }}>{title}</p>
      <p className="label" style={{ marginBottom: '28px' }}>{sub}</p>
      <button onClick={onAction} className="btn-primary" style={{ padding: '12px 28px' }}>{action}</button>
    </div>
  )
}
