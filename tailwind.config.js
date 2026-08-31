/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'gem-navy':       '#0A1628',
        'gem-navy-light': '#0F1E38',
        'gem-blue':       '#1B4FDE',
        'gem-blue-light': '#3B82F6',
        'gem-blue-pale':  '#EFF6FF',
        'gem-green':      '#0D9F6F',
        'gem-green-light':'#10B981',
        'gem-green-pale': '#ECFDF5',
        'gem-amber':      '#F59E0B',
        'gem-amber-pale': '#FFFBEB',
        'gem-red':        '#EF4444',
        'gem-red-pale':   '#FEF2F2',
        'gem-white':      '#F8FAFC',
        'gem-slate':      '#1E293B',
        'gem-muted':      '#64748B',
        'gem-border':     '#E2E8F0',
        'gem-border-dark':'rgba(255,255,255,0.12)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gem-gradient':       'linear-gradient(135deg, #0A1628 0%, #0F1E38 50%, #0A2040 100%)',
        'gem-card-gradient':  'linear-gradient(135deg, rgba(27,79,222,0.15) 0%, rgba(13,159,111,0.08) 100%)',
        'gem-hero-gradient':  'radial-gradient(ellipse at 60% 50%, rgba(27,79,222,0.25) 0%, transparent 70%)',
        'gem-beam':           'linear-gradient(135deg, transparent 0%, rgba(59,130,246,0.15) 45%, rgba(59,130,246,0.05) 55%, transparent 100%)',
      },
      backdropBlur: {
        'gem': '12px',
      },
      boxShadow: {
        'gem-card':  '0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
        'gem-glow':  '0 0 32px rgba(27,79,222,0.25)',
        'gem-green': '0 0 24px rgba(13,159,111,0.3)',
        'gem-card-light': '0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
      },
      animation: {
        'beam':         'beam 4s ease-in-out infinite',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-up':     'slideUp 0.5s ease-out',
        'fade-in':      'fadeIn 0.4s ease-out',
        'spin-slow':    'spin 3s linear infinite',
        'float':        'float 6s ease-in-out infinite',
      },
      keyframes: {
        beam: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '300% 0' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
