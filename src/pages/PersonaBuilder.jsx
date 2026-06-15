import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { extractPersona } from '../lib/claude.js'
import { savePersona, getPersonaById } from '../lib/storage.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

const EMPTY_PERSONA = {
  communicationStyle: '',
  priorities: ['', '', ''],
  likelyObjections: ['', '', ''],
  respondsWellTo: ['', ''],
  watchOutFor: ['', ''],
}

export default function PersonaBuilder({ onApiKeyClear }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [rawNotes, setRawNotes] = useState('')
  const [calibration, setCalibration] = useState('')
  const [persona, setPersona] = useState(EMPTY_PERSONA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [existingId, setExistingId] = useState(null)

  useEffect(() => {
    if (!isNew) {
      const existing = getPersonaById(id)
      if (existing) {
        setName(existing.name); setRole(existing.role); setRawNotes(existing.rawNotes)
        setPersona({
          communicationStyle: existing.communicationStyle,
          priorities: existing.priorities,
          likelyObjections: existing.likelyObjections,
          respondsWellTo: existing.respondsWellTo,
          watchOutFor: existing.watchOutFor,
        })
        setExistingId(existing.id); setStep(2)
      }
    }
  }, [id, isNew])

  async function handleExtract() {
    if (!rawNotes.trim()) return
    setLoading(true); setError(null)
    try {
      const result = await extractPersona({ name, role, rawNotes })
      setPersona({
        communicationStyle: result.communicationStyle || '',
        priorities: result.priorities || ['', '', ''],
        likelyObjections: result.likelyObjections || ['', '', ''],
        respondsWellTo: result.respondsWellTo || ['', ''],
        watchOutFor: result.watchOutFor || ['', ''],
      })
      setStep(2)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleCalibrate() {
    if (!calibration.trim()) return
    setLoading(true); setError(null)
    try {
      const result = await extractPersona({ name, role, rawNotes, calibration })
      setPersona({
        communicationStyle: result.communicationStyle || '',
        priorities: result.priorities || ['', '', ''],
        likelyObjections: result.likelyObjections || ['', '', ''],
        respondsWellTo: result.respondsWellTo || ['', ''],
        watchOutFor: result.watchOutFor || ['', ''],
      })
      setCalibration('')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  function handleSave() {
    const now = Date.now()
    savePersona({
      id: existingId || uuid(), name: name || 'Unnamed', role: role || '',
      communicationStyle: persona.communicationStyle,
      priorities: persona.priorities, likelyObjections: persona.likelyObjections,
      respondsWellTo: persona.respondsWellTo, watchOutFor: persona.watchOutFor,
      rawNotes, createdAt: now, updatedAt: now, calibrationLog: [],
    })
    navigate('/library')
  }

  function updateListItem(field, index, value) {
    setPersona(prev => { const arr = [...prev[field]]; arr[index] = value; return { ...prev, [field]: arr } })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav onApiKeyClear={onApiKeyClear} />
      <div className="flex-1 px-8 md:px-12 py-12" style={{ maxWidth: '720px' }}>

        {step === 1 && (
          <>
            <p className="label mb-3">◼ Persona Builder</p>
            <h2 className="font-sans font-black text-4xl md:text-5xl text-text-primary uppercase tracking-tight mb-2">
              New Persona
            </h2>
            <p className="font-mono text-sm text-text-secondary mb-10">
              The more context you give, the more accurate the simulation.
            </p>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah Chen" className="field-input" />
                </Field>
                <Field label="Role / Title">
                  <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Head of Engineering" className="field-input" />
                </Field>
              </div>
              <Field label="Context">
                <textarea
                  value={rawNotes} onChange={e => setRawNotes(e.target.value)}
                  placeholder="Paste anything: emails, meeting notes, feedback, LinkedIn bio, Slack messages, performance reviews..."
                  rows={10} className="field-input resize-none"
                />
              </Field>
              <label className="font-mono text-xs uppercase tracking-widest text-text-secondary cursor-pointer inline-flex items-center gap-3 hover:text-text-primary transition-colors">
                <span style={{ border: '1px solid #333', padding: '6px 12px' }}>Upload PDF</span>
                <span className="text-text-dim">PDF text will be appended above</span>
                <input type="file" accept=".pdf,.txt" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return
                    const r = new FileReader()
                    r.onload = () => setRawNotes(prev => prev + '\n\n[PDF: ' + file.name + ']\n' + r.result)
                    r.readAsText(file)
                  }} />
              </label>
            </div>

            {error && <p className="font-mono text-sm text-accent mt-4">{error}</p>}

            <button onClick={handleExtract} disabled={!rawNotes.trim() || loading} className="btn-primary mt-8 w-full py-4">
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="dot-red" /> Extracting...
                </span>
              ) : 'Extract Persona →'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="label mb-3">◼ Persona Builder: Step 2</p>
            <h2 className="font-sans font-black text-4xl md:text-5xl text-text-primary uppercase tracking-tight mb-2">
              Review & Edit
            </h2>
            <p className="font-mono text-sm text-text-secondary mb-10">
              Edit any field. This is what the simulation uses.
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name"><input value={name} onChange={e => setName(e.target.value)} className="field-input" /></Field>
                <Field label="Role"><input value={role} onChange={e => setRole(e.target.value)} className="field-input" /></Field>
              </div>
              <Field label="Communication Style">
                <textarea value={persona.communicationStyle} onChange={e => setPersona(p => ({ ...p, communicationStyle: e.target.value }))} rows={2} className="field-input resize-none" />
              </Field>
              <Field label="Core Priorities">
                {persona.priorities.map((v, i) => (
                  <input key={i} value={v} onChange={e => updateListItem('priorities', i, e.target.value)} className="field-input mb-2" placeholder={`Priority ${i + 1}`} />
                ))}
              </Field>
              <Field label="Likely Objections">
                {persona.likelyObjections.map((v, i) => (
                  <input key={i} value={v} onChange={e => updateListItem('likelyObjections', i, e.target.value)} className="field-input mb-2" placeholder={`Objection ${i + 1}`} />
                ))}
              </Field>
              <Field label="Responds Well To">
                {persona.respondsWellTo.map((v, i) => (
                  <input key={i} value={v} onChange={e => updateListItem('respondsWellTo', i, e.target.value)} className="field-input mb-2" placeholder={`Approach ${i + 1}`} />
                ))}
              </Field>
              <Field label="Watch Out For">
                {persona.watchOutFor.map((v, i) => (
                  <input key={i} value={v} onChange={e => updateListItem('watchOutFor', i, e.target.value)} className="field-input mb-2" placeholder={`Watch out ${i + 1}`} />
                ))}
              </Field>

              <details className="group">
                <summary className="font-mono text-xs uppercase tracking-widest text-text-dim cursor-pointer hover:text-text-secondary transition-colors list-none">
                  ▶ Raw notes
                </summary>
                <textarea value={rawNotes} onChange={e => setRawNotes(e.target.value)} rows={5} className="field-input resize-none mt-3 text-sm" />
              </details>

              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '24px' }}>
                <p className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-3">
                  Calibrate: observed something unexpected?
                </p>
                <textarea value={calibration} onChange={e => setCalibration(e.target.value)}
                  placeholder="e.g. They pushed back way harder than expected on cost..."
                  rows={3} className="field-input resize-none mb-3" />
                <button onClick={handleCalibrate} disabled={!calibration.trim() || loading} className="btn-secondary text-xs px-5 py-3">
                  {loading ? 'Updating...' : 'Update Persona'}
                </button>
              </div>
            </div>

            {error && <p className="font-mono text-sm text-accent mt-4">{error}</p>}

            <div className="flex gap-3 mt-10">
              <button onClick={() => setStep(1)} className="btn-secondary text-xs px-5 py-4">
                + Add more context
              </button>
              <button onClick={handleSave} className="btn-primary flex-1 py-4">
                Save Persona
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <p className="label mb-2">{label}</p>
      {children}
    </div>
  )
}
