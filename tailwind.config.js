/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['Poppins', 'monospace'],
      },
      colors: {
        bg: '#0a0a0a',
        surface: '#111111',
        'surface-2': '#1a1a1a',
        'border-dim': '#222222',
        'border-bright': '#333333',
        accent: '#00ff88',
        'accent-hover': '#00ffaa',
        'text-primary': '#f5f5f5',
        'text-secondary': '#888888',
        'text-dim': '#555555',
      },
    },
  },
  plugins: [],
}
