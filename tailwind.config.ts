import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background:    'var(--bg)',
        surface:       'var(--surface)',
        'surface-2':   'var(--surface2)',
        'surface-3':   'var(--surface3)',
        border:        'var(--border)',
        primary:       'var(--primary)',
        gold:          'var(--gold)',
        info:          'var(--info)',
        live:          'var(--live)',
        warning:       'var(--warning)',
        'text-primary':   'var(--text1)',
        'text-secondary': 'var(--text2)',
        'text-muted':     'var(--text3)',
        win:  'var(--primary)',
        draw: 'var(--gold)',
        loss: 'var(--live)',
        danger: 'var(--live)',
      },
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'sans-serif'],
        display: ['Syne', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glass':       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card':        '0 4px 24px rgba(0,0,0,0.5)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,135,0.15)',
        'glow-primary':'0 0 20px rgba(0,255,135,0.3)',
        'glow-live':   '0 0 20px rgba(255,69,69,0.35)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00ff87, #00b4d8)',
        'gradient-gold':    'linear-gradient(135deg, #ffd700, #ff9500)',
        'gradient-glass':   'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
      },
      animation: {
        'live-ping': 'live-ping 1.5s ease-in-out infinite',
        shimmer:     'shimmer 1.5s linear infinite',
      },
      keyframes: {
        'live-ping': {
          '0%, 100%': { transform: 'scale(1)',   opacity: '1' },
          '50%':      { transform: 'scale(1.6)', opacity: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
