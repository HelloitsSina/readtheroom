// Simulation screen — shows all 6 role cards simultaneously loading.
import RoleCard from './RoleCard.jsx'

export default function RoleGrid({ roles, responses, onCardClick, onBack }) {
  const allDone = roles.every(r => responses[r.id]?.text || responses[r.id]?.error)

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button onClick={onBack} className="btn-ghost mb-3 flex items-center gap-1">
              ← New proposal
            </button>
            <h2 className="text-2xl font-bold text-white">The Room</h2>
            <p className="text-zinc-500 text-sm mt-1">
              {allDone
                ? 'All six have read your proposal. Click any card to respond.'
                : 'Six people are reading your proposal right now…'}
            </p>
          </div>
        </div>

        {/* 6-up grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => (
            <RoleCard
              key={role.id}
              role={role}
              response={responses[role.id]?.text}
              loading={responses[role.id]?.loading}
              error={responses[role.id]?.error}
              onClick={() => onCardClick(role)}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
