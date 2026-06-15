const KEY = 'readtheroom_personas'

export function getPersonas() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function savePersona(persona) {
  const all = getPersonas()
  const idx = all.findIndex(p => p.id === persona.id)
  if (idx >= 0) {
    all[idx] = persona
  } else {
    all.push(persona)
  }
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function deletePersona(id) {
  const all = getPersonas().filter(p => p.id !== id)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function getPersonaById(id) {
  return getPersonas().find(p => p.id === id) || null
}
