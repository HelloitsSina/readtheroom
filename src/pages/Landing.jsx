import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ContactLink } from '../components/Footer.jsx'

const STEPS = [
  {
    num: '01',
    title: 'Build your personas',
    desc: 'Paste emails, notes, or any context about the people you need to influence. Claude extracts a structured profile of how they think.',
  },
  {
    num: '02',
    title: 'Describe your situation',
    desc: 'Write out your proposal, the conversation you need to have, or what you are worried about. No template required.',
  },
  {
    num: '03',
    title: 'Run the room',
    desc: 'Six role perspectives respond in parallel. Click any card to go deeper and rehearse the real conversation.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [enterHovered, setEnterHovered] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a', fontFamily: 'Poppins, sans-serif' }}>

      {/* Top bar */}
      <div style={{ padding: '28px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#f5f5f5' }}>
          READTHEROOM
        </span>
        <button
          onClick={() => navigate('/library')}
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            color: '#aaa',
            background: 'transparent',
            border: '1px solid #333',
            padding: '7px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#00ff88'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = '#333' }}
        >
          Enter the Room
        </button>
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px 40px' }}>

        <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00ff88', marginBottom: '28px' }}>
          &#9632; Conversation Intelligence
        </p>

        <h1 style={{
          fontWeight: 900,
          fontSize: 'clamp(3rem, 9.6vw, 999px)',
          letterSpacing: '-0.03em',
          lineHeight: 0.9,
          textTransform: 'uppercase',
          color: '#f5f5f5',
          marginBottom: '36px',
          whiteSpace: 'nowrap',
        }}>
          READ THE <span style={{ color: '#00ff88' }}>ROOM.</span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '1rem', color: '#888', letterSpacing: '0.01em' }}>
            &gt;&nbsp;What if you already knew how the room would respond?
          </p>
          <span className="cursor-blink" />
        </div>

        <p style={{ fontSize: '1rem', color: '#666', maxWidth: '34rem', lineHeight: 1.7, marginBottom: '44px' }}>
          Build profiles of the real people you need to influence.
          Simulate the conversation before it happens so you walk in prepared, not hoping.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={() => navigate('/library')}
            onMouseEnter={() => setEnterHovered(true)}
            onMouseLeave={() => setEnterHovered(false)}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '16px 40px',
              background: '#00ff88',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: 0,
              cursor: 'pointer',
              boxShadow: enterHovered ? '0 0 40px #00ff88aa' : '0 0 24px #00ff8855',
              transform: enterHovered ? 'translateY(-1px)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Enter the Room &rarr;
          </button>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444' }}>
            No account needed
          </span>
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '60px 64px', borderTop: '1px solid #1a1a1a' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#555', marginBottom: '36px' }}>
          How it works
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {STEPS.map(step => (
            <StepCard key={step.num} step={step} />
          ))}
        </div>
      </div>

      {/* Footer pitch */}
      <div style={{ padding: '32px 64px', borderTop: '1px solid #161616', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <p style={{ fontSize: '0.8rem', color: '#444' }}>I built an AI that thinks like the people you need to influence.</p>
          <p style={{ fontSize: '0.8rem', color: '#666' }}>Stop guessing.</p>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f5f5f5' }}>Start winning the room.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ContactLink />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="dot-status" />
            <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#444' }}>System online</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepCard({ step }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#131313' : '#0f0f0f',
        border: '1px solid #1e1e1e',
        borderTop: hovered ? '1px solid #00ff88' : '1px solid #1e1e1e',
        padding: '28px 24px',
        transition: 'all 0.2s ease',
      }}
    >
      <p style={{
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 800,
        fontSize: '1.5rem',
        color: '#00ff88',
        marginBottom: '12px',
        textShadow: hovered ? '0 0 12px rgba(0,255,136,0.55)' : 'none',
        transition: 'text-shadow 0.2s ease',
      }}>
        {step.num}
      </p>
      <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#f5f5f5', marginBottom: '10px' }}>
        {step.title}
      </p>
      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.825rem', color: '#888', lineHeight: 1.65 }}>
        {step.desc}
      </p>
    </div>
  )
}
