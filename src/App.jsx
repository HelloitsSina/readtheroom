import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { hasApiKey } from './lib/apiKey.js'
import ApiKeyGate from './components/ApiKeyGate.jsx'
import Landing from './pages/Landing.jsx'
import Library from './pages/Library.jsx'
import PersonaBuilder from './pages/PersonaBuilder.jsx'
import PrepSession from './pages/PrepSession.jsx'

export default function App() {
  // Track whether a valid key exists so we can re-render when it changes
  const [keySaved, setKeySaved] = useState(hasApiKey())

  if (!keySaved) {
    return <ApiKeyGate onSave={() => setKeySaved(true)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/library" element={<Library onApiKeyClear={() => setKeySaved(false)} />} />
        <Route path="/persona/:id" element={<PersonaBuilder onApiKeyClear={() => setKeySaved(false)} />} />
        <Route path="/session" element={<PrepSession onApiKeyClear={() => setKeySaved(false)} />} />
      </Routes>
    </BrowserRouter>
  )
}
