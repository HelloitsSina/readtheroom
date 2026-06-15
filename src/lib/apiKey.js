const STORAGE_KEY = 'readtheroom_api_key'

export function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || ''
}

export function setApiKey(key) {
  localStorage.setItem(STORAGE_KEY, key.trim())
}

export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasApiKey() {
  return getApiKey().length > 0
}

// Returns a masked display version: sk-ant-api03-••••••••XXXX
export function maskedKey() {
  const key = getApiKey()
  if (!key) return ''
  const tail = key.slice(-4)
  const prefix = key.slice(0, 14) // "sk-ant-api03-"
  return `${prefix}${'•'.repeat(8)}${tail}`
}
