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
        // Government of India standard palette
        'gov-blue':       '#003c8f', // deep blue typical of gov sites
        'gov-blue-light': '#1976d2',
        'gov-saffron':    '#ff9933', // flag saffron
        'gov-green':      '#138808', // flag green
        'gov-bg':         '#f8f9fa',
        'gov-text':       '#212529',
        'gov-border':     '#dee2e6',
        
        // Legacy mapping for existing classes to avoid breaking immediately
        'gem-navy':       '#ffffff', // Swapped to white
        'gem-navy-light': '#f8f9fa',
        'gem-blue':       '#003c8f', // Map to gov blue
        'gem-blue-light': '#1976d2',
        'gem-blue-pale':  '#e3f2fd',
        'gem-green':      '#138808',
        'gem-green-light':'#28a745',
        'gem-green-pale': '#d4edda',
        'gem-amber':      '#ff9933',
        'gem-amber-pale': '#fff3cd',
        'gem-red':        '#dc3545',
        'gem-red-pale':   '#f8d7da',
        'gem-white':      '#212529', // Swap white to dark text for contrast
        'gem-slate':      '#ffffff',
        'gem-muted':      '#6c757d',
        'gem-border':     '#dee2e6',
        'gem-border-dark':'#dee2e6',
      },
      fontFamily: {
        display: ['"Open Sans"', 'sans-serif'], // standard gov font
        body:    ['"Open Sans"', 'sans-serif'],
        mono:    ['"Courier New"', 'monospace'],
      },
      backgroundImage: {
        'gem-gradient':       'none',
        'gem-card-gradient':  'none',
        'gem-hero-gradient':  'none',
      },
      backdropBlur: {
        'gem': 'none',
      },
      boxShadow: {
        'gem-card':  '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'gem-glow':  'none',
      },
      animation: {
        'pulse-slow':   'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
