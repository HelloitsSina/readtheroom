import { useState } from 'react'

export default function Footer() {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{
      padding: '16px 48px',
      borderTop: '1px solid #111',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <ContactLink hovered={hovered} setHovered={setHovered} />
    </div>
  )
}

export function ContactLink() {
  const [hovered, setHovered] = useState(false)

  return (
    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#333', margin: 0 }}>
      Built by Sina{' '}
      <a
        href="mailto:sina.j.zhang@gmail.com"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          color: hovered ? '#00ff88' : '#333',
          textDecoration: 'none',
          transition: 'color 0.2s',
        }}
      >
        sina.j.zhang@gmail.com
      </a>
    </p>
  )
}
