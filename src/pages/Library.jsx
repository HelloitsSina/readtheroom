import { useState, useEffect, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPersonas, deletePersona, savePersona } from '../lib/storage.js'
import { getSessions, deleteSession } from '../lib/sessions.js'
import { ROLES } from '../data/roles.js'
import PersonaCard from '../components/PersonaCard.jsx'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { v4 as uuid } from 'uuid'

const EXAMPLE_PROPOSAL = `I want to propose shifting our Apex customer support model from reactive to proactive. Specifically: assigning 0.5 FTE to run a structured outreach program in the two weeks before each assessment window, helping schools prepare rather than waiting for them to report problems.

The business case is that schools who are well prepared have fewer escalations, higher satisfaction scores, and are more likely to renew and expand. Last assessment cycle we had 34 escalations in a 10 day window, most were preventable with earlier contact.

I am asking for 0.5 FTE (reallocation, not new hire) and sign off to build a simple outreach playbook. Total cost is internal time only. Pilot would run for one assessment cycle before formal review.`

const EXAMPLE_PERSONAS = [
  {
    name: 'James Whitfield',
    role: 'Head of Customer Success',
    isExample: true,
    rawNotes: `James has been at Edrolo for 4 years and came from a SaaS background before edtech. He is supportive of the team but very focused on efficiency metrics. He regularly references NPS, time-to-resolution, and renewal rates in team meetings.

In our last 1:1 he said: "I want us to be known for the best support in edtech, but I need to see that we are not just adding headcount without a clear output."

He tends to approve proposals that come with data. He gets nervous about anything that requires cross-team coordination without a clear owner. He prefers to be looped in early and does not like surprises before leadership meetings.

He will ask: what does success look like after one cycle, and how do we know if this is working? He also wants to know that the wider team is on board before this goes up. Warm in person, terse on Slack. If he goes quiet in a meeting he is either unconvinced or already thinking about how to position it upward.`,
    communicationStyle: 'Data-driven and efficiency-focused. Warm in person, terse on Slack. Goes quiet when unconvinced.',
    priorities: ['efficiency metrics', 'NPS and renewal rates', 'clear ownership', 'no surprises before leadership meetings'],
    likelyObjections: ['What does success look like after one cycle?', 'How do we know if this is working?', 'Is the wider team on board?'],
    respondsWellTo: ['proposals backed by data', 'early looping in', 'clear ownership and accountability'],
    watchOutFor: ['cross-team coordination without a clear owner', 'surprises before leadership meetings', 'silence in meetings means doubt'],
    defaultRoleOverride: 'manager',
  },
  {
    name: 'Culture Coach',
    role: 'Australian Workplace Cultural Translator',
    isExample: true,
    rawNotes: `Focus areas for this proposal:

The presenter is from an East Asian background and tends to lead with the solution and the detail before establishing the problem and the relationship context. In Australian leadership meetings, this can read as presumptuous or under-consulted.

Key patterns to watch: Has the problem been named clearly before the fix is presented? Has the presenter signalled that others' input shaped the proposal, rather than presenting it as a solo idea? Is the ask framed as "I want to try this" or "I have been working through this with the team and wanted to bring it forward"?

The meeting before the meeting matters here. Key stakeholders need a soft heads up before this hits a formal setting. Springing a request in a group meeting without pre-alignment will create resistance even from people who might otherwise support it.`,
    communicationStyle: 'Empathetic and specific. Gives concrete reframes without being condescending.',
    priorities: ['naming the problem before the fix', 'signalling team input', 'the meeting before the meeting'],
    likelyObjections: ['Has the problem been named clearly?', 'Does this read as a solo idea?', 'Have key stakeholders had a soft heads up?'],
    respondsWellTo: ['framing ideas as team-developed', 'pre-alignment before formal settings', 'leading with the problem'],
    watchOutFor: ['leading with solution before problem', 'presenting as solo idea', 'skipping informal pre-alignment steps'],
    defaultRoleOverride: 'culture',
    extraContext: `Focus areas for this proposal:

The presenter is from an East Asian background and tends to lead with the solution and the detail before establishing the problem and the relationship context. In Australian leadership meetings, this can read as presumptuous or under-consulted.

Key patterns to watch: Has the problem been named clearly before the fix is presented? Has the presenter signalled that others' input shaped the proposal, rather than presenting it as a solo idea? Is the ask framed as "I want to try this" or "I have been working through this with the team and wanted to bring it forward"?

The meeting before the meeting matters here. Key stakeholders need a soft heads up before this hits a formal setting. Springing a request in a group meeting without pre-alignment will create resistance even from people who might otherwise support it.`,
  },
]

const EXAMPLE_PROPOSAL_KEY = 'readtheroom_example_proposal'

export default function Library() {
  const [tab, setTab] = useState('personas')
  const [personas, setPersonas] = useState([])
  const [sessions, setSessions] = useState([])
  const [expandedSession, setExpandedSession] = useState(null)
  const [viewingRole, setViewingRole] = useState(null)
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

  function handleLoadExamples() {
    const now = new Date().toISOString()
    EXAMPLE_PERSONAS.forEach(ep => {
      const persona = {
        id: uuid(),
        ...ep,
        updatedAt: now,
        createdAt: now,
      }
      savePersona(persona)
    })
    localStorage.setItem(EXAMPLE_PROPOSAL_KEY, EXAMPLE_PROPOSAL)
    setPersonas(getPersonas())
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
      <Nav />
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
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => navigate('/persona/new')} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '8px 18px' }}>
                + New Persona
              </button>
            </div>
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
          <div>
            {/* Default Roles section */}
            <div style={{ marginBottom: '40px' }}>
              <p className="label" style={{ marginBottom: '16px', letterSpacing: '0.14em' }}>
                DEFAULT ROLES, ALWAYS IN THE ROOM
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {ROLES.map(role => (
                  <DefaultRoleCard key={role.id} role={role} onClick={() => setViewingRole(role)} />
                ))}
              </div>
            </div>

            {/* Your Personas section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <p className="label" style={{ letterSpacing: '0.14em' }}>YOUR PERSONAS</p>
                {personas.length === 0 && (
                  <button
                    onClick={handleLoadExamples}
                    className="btn-secondary"
                    style={{ fontSize: '0.65rem', padding: '6px 14px' }}
                  >
                    Try Example Personas
                  </button>
                )}
              </div>

              {personas.length === 0 ? (
                <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: '#222', marginBottom: '20px' }}>[ ]</p>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f5f5f5', marginBottom: '8px' }}>No personas yet</p>
                  <p className="label" style={{ marginBottom: '28px' }}>Add your first persona or try the examples to see how it works</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate('/persona/new')} className="btn-primary" style={{ padding: '12px 28px' }}>+ Add Persona</button>
                    <button onClick={handleLoadExamples} className="btn-secondary" style={{ padding: '12px 28px' }}>Try Example Personas</button>
                  </div>
                </div>
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
              )}
            </div>
          </div>
        )}

        {/* Sessions tab */}
        {tab === 'sessions' && (
          sessions.length === 0 ? (
            <EmptyState
              icon="[ ]"
              title="No sessions yet"
              sub="Run a prep session to see your history here"
              action="New Session"
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

      {/* Default role detail modal */}
      {viewingRole && (
        <DefaultRoleModal role={viewingRole} onClose={() => setViewingRole(null)} />
      )}

      <Footer />
    </div>
  )
}

function DefaultRoleCard({ role, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#141414' : '#0d0d0d',
        border: '1px solid #1e1e1e',
        borderTop: '2px solid #333',
        cursor: 'pointer',
        padding: '16px',
        transition: 'all 0.15s',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{role.emoji}</div>
      <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#d0d0d0', marginBottom: '4px' }}>{role.title}</p>
      <p style={{ fontSize: '0.7rem', color: '#555', lineHeight: 1.4 }}>{role.descriptor}</p>
      <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', marginTop: '10px' }}>
        READ ONLY
      </p>
    </div>
  )
}

function DefaultRoleModal({ role, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111', border: '1px solid #2a2a2a', borderTop: '2px solid #00ff88',
          maxWidth: '560px', width: '100%', padding: '32px',
          fontFamily: 'Poppins, sans-serif', maxHeight: '80vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '2rem' }}>{role.emoji}</span>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f5f5f5', marginTop: '8px' }}>{role.title}</h3>
            <p style={{ fontSize: '0.72rem', color: '#666', marginTop: '2px' }}>{role.descriptor}</p>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', marginTop: '4px' }}
            onMouseEnter={e => e.target.style.color = '#f5f5f5'}
            onMouseLeave={e => e.target.style.color = '#555'}
          >
            &#10005;
          </button>
        </div>
        <p className="label" style={{ marginBottom: '10px' }}>HOW THIS ROLE RESPONDS</p>
        <p style={{ fontSize: '0.82rem', color: '#888', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
          {role.systemPrompt}
        </p>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#333', marginTop: '24px', fontStyle: 'italic' }}>
          This role is always available in every prep session and cannot be edited.
        </p>
      </div>
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
            {expanded ? 'Close' : 'View'}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #1a1a1a', padding: '0 20px 24px' }}>
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
