import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base
        background:  '#0a0f1e',
        surface:     '#0d1b2a',
        'surface-2': '#112240',
        'surface-3': '#1a2f4a',
        border:      '#1e3a5f',
        // Accent
        primary:   '#00ff87',
        'primary-dim': '#00cc6a',
        gold:      '#ffd700',
        'gold-dim': '#cc9b00',
        // Text
        'text-primary':   '#e8f4fd',
        'text-secondary': '#8bafc7',
        'text-muted':     '#4a6fa5',
        // Status
        live:    '#ff4545',
        win:     '#00ff87',
        draw:    '#ffd700',
        loss:    '#ff4545',
        // Danger
        danger:  '#ff4545',
        warning: '#ff9500',
        info:    '#00b4d8',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial':    'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glass':     'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'gradient-primary':   'linear-gradient(135deg, #00ff87 0%, #00b4d8 100%)',
        'gradient-gold':      'linear-gradient(135deg, #ffd700 0%, #ff9500 100%)',
        'gradient-danger':    'linear-gradient(135deg, #ff4545 0%, #ff9500 100%)',
      },
      boxShadow: {
        'glass':        '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glow-primary': '0 0 20px rgba(0, 255, 135, 0.3), 0 0 60px rgba(0, 255, 135, 0.1)',
        'glow-gold':    '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-live':    '0 0 20px rgba(255, 69, 69, 0.4)',
        'card':         '0 4px 24px rgba(0, 0, 0, 0.5)',
        'card-hover':   '0 8px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 255, 135, 0.15)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'pulse-live':   'pulse-live 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'glow-pulse':   'glow-pulse 3s ease-in-out infinite',
        'score-tick':   'score-tick 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.95)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 135, 0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(0, 255, 135, 0.5)' },
        },
        'score-tick': {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
