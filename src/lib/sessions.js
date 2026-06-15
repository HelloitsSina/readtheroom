const KEY = 'readtheroom_sessions'

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveSession(session) {
  const all = getSessions()
  const idx = all.findIndex(s => s.id === session.id)
  if (idx >= 0) {
    all[idx] = session
  } else {
    all.unshift(session) // newest first
  }
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function getSessionById(id) {
  return getSessions().find(s => s.id === id) || null
}

export function deleteSession(id) {
  const all = getSessions().filter(s => s.id !== id)
  localStorage.setItem(KEY, JSON.stringify(all))
}

// Update just the conversation log for one role within a session
export function updateSessionConversation(sessionId, roleId, messages) {
  const all = getSessions()
  const idx = all.findIndex(s => s.id === sessionId)
  if (idx < 0) return
  if (!all[idx].conversations) all[idx].conversations = {}
  all[idx].conversations[roleId] = messages
  localStorage.setItem(KEY, JSON.stringify(all))
}
