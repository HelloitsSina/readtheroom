// Conversation screen — full chat interface with one persona.
// Shows the full initial response and allows back-and-forth.
import { useState, useRef, useEffect } from 'react'
import { getContinuedResponse } from '../lib/claude.js'

export default function Conversation({ role, proposal, initialResponse, onBack }) {
  const [messages, setMessages] = useState([
    { from: 'persona', text: initialResponse }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const newMessages = [...messages, { from: 'user', text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError(null)

    // Build the conversation history for the API (alternating user/assistant)
    const history = []
    // First message from persona becomes the assistant turn
    let i = 0
    for (const msg of newMessages) {
      if (msg.from === 'persona') {
        history.push({ role: 'assistant', content: msg.text })
      } else {
        history.push({ role: 'user', content: msg.text })
      }
      i++
    }

    try {
      const reply = await getContinuedResponse(role, proposal, history)
      setMessages(prev => [...prev, { from: 'persona', text: reply }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="btn-ghost">
          ← Back to room
        </button>
        <div className="h-4 w-px bg-zinc-800" />
        <span className="text-lg">{role.emoji}</span>
        <div>
          <p className="font-semibold text-zinc-100 text-sm leading-none">{role.title}</p>
          <p className="text-zinc-500 text-xs mt-0.5">{role.tagline}</p>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 space-y-6 mb-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.from === 'persona' && (
              <span className="text-xl mr-3 mt-1 flex-shrink-0">{role.emoji}</span>
            )}
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.from === 'user'
                  ? 'bg-white text-zinc-900 rounded-br-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-bl-sm'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <span className="text-xl">{role.emoji}</span>
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1.5 items-center h-4">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Respond to ${role.title.toLowerCase()}…`}
          disabled={loading}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3
                     text-zinc-100 placeholder:text-zinc-600 text-sm
                     focus:outline-none focus:border-zinc-500 transition-colors
                     disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary px-5 py-3 rounded-xl"
        >
          Send
        </button>
      </form>

    </div>
  )
}
