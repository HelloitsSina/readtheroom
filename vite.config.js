import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// No server-side proxy needed. All API calls go directly from the browser
// to the Anthropic API using the user's own key (BYOK model).
export default defineConfig({
  plugins: [react()],
})
