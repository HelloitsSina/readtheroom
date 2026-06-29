import { useState, useMemo, useRef, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import { DEFAULT_ROLES } from '../data/defaultRoles.js'
import { getPersonas } from '../lib/storage.js'
import { getInitialResponse, getContinuedResponse } from '../lib/claude.js'
import { saveSession, getSessions, updateSessionConversation } from '../lib/sessions.js'
import { hasApiKey } from '../lib/apiKey.js'
import RoleCard from '../components/RoleCard.jsx'
import ConversationThread from '../components/ConversationThread.jsx'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import ApiKeyModal from '../components/ApiKeyModal.jsx'

const DEFAULT_SCENARIO_TYPES = ['Proposal', 'Coffee Chat', 'Difficult Conversation', 'Other']

const ROLE_EMOJIS = {
  manager: '🧑‍💼', skeptic: '🔍', finance: '📊',
  people: '🤝', champion: '🎯', culture: '🦘',
}

function personaToRole(p) {
  return {
    id: p.id, emoji: '🧑', title: p.name, descriptor: p.role || 'Saved persona',
    tagline: 'Custom persona', isPersona: true,
    communicationStyle: p.communicationStyle, priorities: p.priorities,
    likelyObjections: p.likelyObjections, respondsWellTo: p.respondsWellTo,
    watchOutFor: p.watchOutFor,
  }
}

const OVERRIDES_KEY = 'readtheroom_role_overrides'

function loadOverrides() {
  try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}') } catch { return {} }
}

export default function PrepSession() {
  const [step, setStep] = useState('setup')
  const [scenarioType, setScenarioType] = useState('Proposal')
  const [scenarioTypes, setScenarioTypes] = useState(DEFAULT_SCENARIO_TYPES)
  const [customInput, setCustomInput] = useState('')
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('readtheroom_example_proposal') || ''
    if (saved) localStorage.removeItem('readtheroom_example_proposal')
    return saved
  })
  const [selectedIds, setSelectedIds] = useState(new Set())
  // Per-role overrides — loaded from localStorage so they survive navigation
  const [roleOverrides, setRoleOverrides] = useState(loadOverrides)
  const [responses, setResponses] = useState({})
  const [activeRole, setActiveRole] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  // Ref to accumulate responses for race-safe session saving
  const collectedRef = useRef({})

  // Persist overrides whenever they change
  useEffect(() => {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(roleOverrides))
  }, [roleOverrides])

  const allParticipants = useMemo(() => {
    const personas = getPersonas()
    return [...DEFAULT_ROLES, ...personas.map(personaToRole)]
  }, [step])

  const selectedParticipants = allParticipants
    .filter(r => selectedIds.has(r.id))
    .map(r => ({
      ...r,
      extraContext: roleOverrides[r.id]?.extraContext || '',
    }))

  const selectedCount = selectedParticipants.length
  const canRun = content.trim().length > 0 && selectedCount > 0

  function toggleParticipant(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function setExtraContext(roleId, text) {
    setRoleOverrides(prev => ({ ...prev, [roleId]: { ...prev[roleId], extraContext: text } }))
  }

  function addCustomScenario() {
    const val = customInput.trim()
    if (!val || scenarioTypes.includes(val)) return
    setScenarioTypes(prev => [...prev, val])
    setScenarioType(val)
    setCustomInput('')
  }

  function handleRun() {
    if (!canRun) return
    if (!hasApiKey()) {
      setPendingAction(() => () => runSession())
      setShowKeyModal(true)
      return
    }
    runSession()
  }

  async function runSession() {
    if (!canRun) return
    const sid = uuid()
    collectedRef.current = {}   // reset accumulator for this run
    setSessionId(sid)
    setStep('simulation')

    saveSession({
      id: sid, createdAt: Date.now(), scenarioType, content,
      participants: selectedParticipants.map(r => ({ id: r.id, title: r.title, isPersona: !!r.isPersona })),
      initialResponses: {}, conversations: {},
    })

    const initial = {}
    selectedParticipants.forEach(r => { initial[r.id] = { loading: true, text: null, error: null } })
    setResponses(initial)

    selectedParticipants.forEach(async (role) => {
      try {
        const text = await getInitialResponse(role, content, scenarioType)
        // Accumulate into ref (no stale closure issue) then write once to localStorage
        collectedRef.current[role.id] = text
        setResponses(prev => ({ ...prev, [role.id]: { loading: false, text, error: null } }))
        // Race-safe: read fresh from storage, patch, write back
        const all = getSessions()
        const idx = all.findIndex(s => s.id === sid)
        if (idx >= 0) {
          all[idx].initialResponses = { ...all[idx].initialResponses, [role.id]: text }
          localStorage.setItem('readtheroom_sessions', JSON.stringify(all))
        }
      } catch (err) {
        setResponses(prev => ({ ...prev, [role.id]: { loading: false, text: null, error: err.message } }))
      }
    })
  }

  // ── Conversation ──────────────────────────────────────────────────────
  if (step === 'conversation' && activeRole) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <ConversationThread
          role={activeRole}
          initialResponse={responses[activeRole.id]?.text}
          onSend={async (msg, history) => {
            if (!hasApiKey()) {
              return new Promise(resolve => {
                setPendingAction(() => async () => {
                  const updated = [...history, { role: 'user', content: msg }]
                  const reply = await getContinuedResponse(activeRole, content, updated, scenarioType)
                  if (sessionId) updateSessionConversation(sessionId, activeRole.id, [...updated, { role: 'assistant', content: reply }])
                  resolve(reply)
                })
                setShowKeyModal(true)
              })
            }
            const updated = [...history, { role: 'user', content: msg }]
            const reply = await getContinuedResponse(activeRole, content, updated, scenarioType)
            if (sessionId) updateSessionConversation(sessionId, activeRole.id, [...updated, { role: 'assistant', content: reply }])
            return reply
          }}
          onBack={() => setStep('simulation')}
          onSwitchRole={setActiveRole}
          allRoles={selectedParticipants}
          responses={responses}
        />
        <Footer />
        {showKeyModal && (
          <ApiKeyModal
            onSave={() => { setShowKeyModal(false); if (pendingAction) { pendingAction(); setPendingAction(null) } }}
            onClose={() => { setShowKeyModal(false); setPendingAction(null) }}
          />
        )}
      </div>
    )
  }

  // ── Simulation grid ───────────────────────────────────────────────────
  if (step === 'simulation') {
    // Detect key errors across all responses
    const allErrors = Object.values(responses).filter(r => !r.loading)
    const keyError = allErrors.length > 0 && allErrors.every(r =>
      r.error === 'INVALID_API_KEY' || r.error === 'NO_API_KEY'
    )

    return (
      <div className="min-h-screen flex flex-col">
        <Nav />

        {/* API key error banner */}
        {keyError && (
          <div style={{
            background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.25)',
            borderLeft: '3px solid #ff5050', padding: '14px 48px',
            display: 'flex', alignItems: 'center', gap: '12px',
            fontFamily: 'Poppins, sans-serif',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#ff8080' }}>&#9888;</span>
            <p style={{ fontSize: '0.8rem', color: '#ff8080', flex: 1 }}>
              Your API key seems invalid. Update it using the API Key menu in the top right.
            </p>
            <button onClick={() => setStep('setup')} className="btn-ghost" style={{ fontSize: '0.7rem', flexShrink: 0 }}>
              &larr; Back
            </button>
          </div>
        )}

        <div style={{ flex: 1, padding: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <p className="label" style={{ marginBottom: '8px' }}>&#9632; Active Session</p>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#f5f5f5' }}>
                The Room
              </h2>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: '#888', marginTop: '8px' }}>
                {scenarioType} &middot; {selectedCount} participant{selectedCount !== 1 ? 's' : ''} &middot; Click a card to go deeper
              </p>
            </div>
            <button onClick={() => setStep('setup')} className="btn-ghost">
              &larr; Back to setup
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {selectedParticipants.map(role => (
              <RoleCard key={role.id} role={role} response={responses[role.id]}
                onClick={() => { if (responses[role.id]?.text) { setActiveRole(role); setStep('conversation') } }}
              />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // ── Setup ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div style={{ flex: 1, padding: '48px', fontFamily: 'Poppins, sans-serif' }}>

        <p className="label" style={{ marginBottom: '12px' }}>&#9632; Prep Session</p>
        <h2 style={{ fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#f5f5f5', marginBottom: '8px' }}>
          Set the Scene
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#888', marginBottom: '36px' }}>
          Describe the situation. Choose who is in the room. Run.
        </p>

        {/* Scenario type */}
        <div style={{ marginBottom: '28px' }}>
          <p className="label" style={{ marginBottom: '12px' }}>Scenario Type</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {scenarioTypes.map(t => (
              <ScenarioTag key={t} label={t} active={scenarioType === t} onClick={() => setScenarioType(t)} />
            ))}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                value={customInput} onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomScenario()}
                placeholder="Add custom..."
                style={{
                  fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 600,
                  letterSpacing: '0.08em', padding: '7px 12px', background: 'transparent',
                  border: '1px solid #2a2a2a', color: '#aaa', outline: 'none', width: '130px',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,0.35)'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
              <button onClick={addCustomScenario} disabled={!customInput.trim()} style={{
                fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.8rem',
                width: '28px', height: '28px',
                background: customInput.trim() ? '#00ff88' : '#1a1a1a',
                color: customInput.trim() ? '#0a0a0a' : '#444',
                border: 'none', cursor: customInput.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>

          {/* Left: textarea */}
          <div>
            <p className="label" style={{ marginBottom: '12px' }}>What are you preparing for?</p>
            <textarea
              value={content} onChange={e => setContent(e.target.value)}
              placeholder="Describe your proposal, what you want to discuss, or what you are worried about..."
              rows={10} className="field-input" style={{ resize: 'none', width: '100%' }}
            />
          </div>

          {/* Right: participants */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p className="label">Participants</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: selectedCount > 0 ? '#00ff88' : '#555' }}>
                  {selectedCount} selected
                </span>
                {['All', 'None'].map(label => (
                  <button key={label}
                    onClick={() => label === 'All' ? setSelectedIds(new Set(allParticipants.map(r => r.id))) : setSelectedIds(new Set())}
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.target.style.color = '#00ff88'} onMouseLeave={e => e.target.style.color = '#555'}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '4px 16px' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#333', padding: '10px 0 4px' }}>
                Default Roles
              </p>
              {DEFAULT_ROLES.map(role => (
                <ParticipantRow
                  key={role.id} role={role}
                  selected={selectedIds.has(role.id)}
                  onToggle={() => toggleParticipant(role.id)}
                  emoji={ROLE_EMOJIS[role.id] || role.emoji}
                  extraContext={roleOverrides[role.id]?.extraContext || ''}
                  onExtraContextChange={text => setExtraContext(role.id, text)}
                />
              ))}

              {allParticipants.filter(r => r.isPersona).length > 0 && (
                <>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#333', padding: '12px 0 4px', borderTop: '1px solid #1a1a1a', marginTop: '4px' }}>
                    Your Personas
                  </p>
                  {allParticipants.filter(r => r.isPersona).map(role => (
                    <ParticipantRow
                      key={role.id} role={role}
                      selected={selectedIds.has(role.id)}
                      onToggle={() => toggleParticipant(role.id)}
                      emoji="🧑"
                      extraContext={roleOverrides[role.id]?.extraContext || ''}
                      onExtraContextChange={text => setExtraContext(role.id, text)}
                    />
                  ))}
                </>
              )}
            </div>

            <RunButton disabled={!canRun} onClick={handleRun} count={selectedCount} hasContent={content.trim().length > 0} />
          </div>
        </div>
      </div>
      <Footer />

      {showKeyModal && (
        <ApiKeyModal
          onSave={() => { setShowKeyModal(false); if (pendingAction) { pendingAction(); setPendingAction(null) } }}
          onClose={() => { setShowKeyModal(false); setPendingAction(null) }}
        />
      )}
    </div>
  )
}

// ── ParticipantRow with inline edit ──────────────────────────────────────────

function ParticipantRow({ role, selected, onToggle, emoji, extraContext, onExtraContextChange }) {
  const [hovered, setHovered] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState(extraContext)
  const hasOverride = extraContext.trim().length > 0

  function handleSave() {
    onExtraContextChange(draft)
    setEditOpen(false)
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setDraft(prev => prev + (prev ? '\n\n' : '') + `[${file.name}]\n${reader.result}`)
    reader.readAsText(file)
  }

  return (
    <div style={{ borderBottom: '1px solid #131313' }}>
      {/* Main row */}
      <div
        style={{
          display: 'flex', alignItems: 'center', padding: '9px 0', cursor: 'pointer',
          background: hovered ? 'rgba(0,255,136,0.02)' : 'transparent', transition: 'background 0.15s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Checkbox */}
        <div onClick={onToggle} style={{
          width: '15px', height: '15px', flexShrink: 0, marginRight: '10px',
          border: selected ? '1px solid #00ff88' : '1px solid #333',
          background: selected ? '#00ff88' : 'transparent',
          borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: selected ? '0 0 8px rgba(0,255,136,0.3)' : 'none', transition: 'all 0.15s',
          cursor: 'pointer',
        }}>
          {selected && <span style={{ color: '#0a0a0a', fontSize: '9px', fontWeight: 900, lineHeight: 1 }}>&#10003;</span>}
        </div>

        {/* Icon */}
        <div onClick={onToggle} style={{
          width: '30px', height: '30px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0f1a12', border: hovered ? '1px solid rgba(0,255,136,0.4)' : '1px solid rgba(0,255,136,0.13)',
          borderRadius: '6px', fontSize: '14px',
          opacity: selected ? 1 : 0.4, transition: 'all 0.15s', marginRight: '10px',
          boxShadow: hovered && selected ? '0 0 10px rgba(0,255,136,0.13)' : 'none', cursor: 'pointer',
        }}>
          {emoji}
        </div>

        {/* Name + descriptor */}
        <div onClick={onToggle} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: selected ? '#ccc' : '#555', transition: 'color 0.15s' }}>
              {role.title}
            </p>
            {hasOverride && (
              <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00ff88', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', padding: '1px 5px' }}>
                edited
              </span>
            )}
          </div>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.65rem', fontWeight: 300, color: '#3a3a3a' }}>{role.descriptor}</p>
        </div>

        {/* Edit toggle button */}
        <button
          onClick={() => { setDraft(extraContext); setEditOpen(o => !o) }}
          title="Edit context"
          style={{
            fontFamily: 'Poppins, sans-serif', fontSize: '0.6rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: editOpen ? '#00ff88' : hovered ? '#aaa' : '#333',
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color 0.15s', paddingLeft: '8px', flexShrink: 0,
          }}
        >
          {editOpen ? 'Close' : 'Edit'}
        </button>
      </div>

      {/* Inline edit panel */}
      {editOpen && (
        <div style={{
          background: '#0a0a0a', border: '1px solid #1e1e1e', borderLeft: '2px solid #00ff88',
          padding: '14px', marginBottom: '8px',
        }}>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00ff88', marginBottom: '8px' }}>
            Additional context for {role.title}
          </p>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', color: '#555', marginBottom: '10px', lineHeight: 1.5 }}>
            Paste notes, past conversations, emails, or anything that helps simulate this person more accurately.
          </p>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={`e.g. In our last 1:1 ${role.title} mentioned they're frustrated with late proposals. They always ask about headcount first...`}
            rows={5}
            className="field-input"
            style={{ resize: 'vertical', width: '100%', marginBottom: '10px', fontSize: '0.8rem' }}
          />

          {/* File upload */}
          <label style={{
            fontFamily: 'Poppins, sans-serif', fontSize: '0.65rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555',
            border: '1px solid #2a2a2a', padding: '5px 10px', cursor: 'pointer',
            transition: 'color 0.2s, border-color 0.2s', display: 'inline-block', marginRight: '8px',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = '#444' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#2a2a2a' }}
          >
            Upload file
            <input type="file" accept=".txt,.pdf,.md" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={handleSave}
              style={{
                fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.7rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                background: '#00ff88', color: '#0a0a0a', border: 'none', padding: '7px 18px',
                cursor: 'pointer', boxShadow: '0 0 16px #00ff8844',
              }}
            >
              Save
            </button>
            {hasOverride && (
              <button
                onClick={() => { setDraft(''); onExtraContextChange(''); setEditOpen(false) }}
                style={{
                  fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.7rem',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: 'transparent', color: '#555', border: '1px solid #2a2a2a', padding: '7px 18px',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ff6666'}
                onMouseLeave={e => e.currentTarget.style.color = '#555'}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Other sub-components ──────────────────────────────────────────────────────

function RunButton({ disabled, onClick, count, hasContent }) {
  const [hovered, setHovered] = useState(false)
  const label = !hasContent ? 'Add content to run'
    : count === 0 ? 'Select participants to run'
    : `Run the Room (${count}) →`

  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', marginTop: '12px',
        fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.8rem',
        letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px',
        background: disabled ? '#141414' : '#00ff88',
        color: disabled ? '#444' : '#0a0a0a',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : hovered ? '0 0 48px #00ff88aa' : '0 0 28px #00ff8844',
        transform: !disabled && hovered ? 'translateY(-1px)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  )
}

function ScenarioTag({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.72rem',
        letterSpacing: '0.08em', textTransform: 'uppercase', padding: '7px 14px',
        background: 'transparent',
        border: active ? '1px solid #00ff88' : hovered ? '1px solid rgba(0,255,136,0.27)' : '1px solid #2a2a2a',
        color: active ? '#00ff88' : hovered ? '#aaa' : '#666',
        cursor: 'pointer',
        boxShadow: active ? '0 0 12px rgba(0,255,136,0.13)' : 'none',
        transition: 'all 0.15s ease',
      }}>
      {label}
    </button>
  )
}
