// Landing screen — the first thing users see.
// Shows a brief explanation and a large text area for the proposal.
export default function ProposalInput({ onSubmit }) {
  function handleSubmit(e) {
    e.preventDefault()
    const text = e.target.proposal.value.trim()
    if (text.length < 50) return
    onSubmit(text)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase mb-3">
            Australian Workplace
          </p>
          <h1 className="text-4xl font-bold text-white mb-4">
            The Room
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Paste your proposal. Six people read it simultaneously — your manager, a skeptic,
            finance, HR, a champion, and a culture coach. Run the room before you walk in.
          </p>
        </div>

        {/* How it works */}
        <div className="flex gap-6 mb-10">
          {[
            { n: '1', label: 'Paste your proposal' },
            { n: '2', label: 'Six personas respond' },
            { n: '3', label: 'Challenge them back' },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400">{n}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <textarea
            name="proposal"
            rows={10}
            placeholder="Describe your proposal here. Be as detailed as you'd be in the real meeting — context, what you're asking for, and why. The more specific you are, the more useful the feedback will be."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-5 text-zinc-100
                       placeholder:text-zinc-600 resize-none focus:outline-none focus:border-zinc-500
                       transition-colors text-sm leading-relaxed"
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-zinc-600 text-xs">
              Nothing is saved. Everything happens in your browser session.
            </p>
            <button type="submit" className="btn-primary">
              Run the Room →
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
