import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Library from './pages/Library.jsx'
import PersonaBuilder from './pages/PersonaBuilder.jsx'
import PrepSession from './pages/PrepSession.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/library" element={<Library />} />
        <Route path="/persona/:id" element={<PersonaBuilder />} />
        <Route path="/session" element={<PrepSession />} />
      </Routes>
    </BrowserRouter>
  )
}
