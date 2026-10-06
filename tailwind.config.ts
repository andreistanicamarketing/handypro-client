import type { Config } from 'tailwindcss';

// ────────────────────────────────────────────────────────────────
// Handy Pro — Design system "Bottega"
// Caldo, artigianale, app-like. Mobile-first.
//   ink    → testo e superfici scure (blu inchiostro profondo)
//   cream  → canvas dell'app (off-white caldo)
//   sand   → superfici secondarie (beige sabbia)
//   ember  → unico accento (arancio brand #FF6600)
// ────────────────────────────────────────────────────────────────

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#152238',
          soft: '#1A3557',
          mute: '#5C6B82',
          faint: '#8A96A8',
        },
        cream: '#FAF6F0',
        sand: {
          DEFAULT: '#F1EAE0',
          deep: '#E6DCCD',
        },
        ember: {
          DEFAULT: '#FF6600',
          soft: '#FFEADB',
          deep: '#E05500',
        },
        verde: {
          DEFAULT: '#2E7D5B',
          soft: '#E3F2EA',
        },
        line: '#E9E2D8',
        // alias legacy (componenti esistenti)
        brand: {
          blue: '#1A3557',
          orange: '#FF6600',
          text: '#152238',
          grey: '#5C6B82',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        accent: ['"Playfair Display"', 'serif'],
      },
      borderRadius: {
        card: '20px',
        sheet: '28px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(21,34,56,0.05), 0 10px 30px -14px rgba(21,34,56,0.16)',
        lift: '0 2px 4px rgba(21,34,56,0.06), 0 18px 44px -16px rgba(21,34,56,0.24)',
        chip: '0 1px 2px rgba(21,34,56,0.08)',
        'nav-up': '0 -4px 24px -8px rgba(21,34,56,0.18)',
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(160deg, #FFFDF9 0%, #FFF3E8 30%, #FFD4A8 60%, #F5A06A 100%)',
        'cta-gradient':
          'radial-gradient(ellipse at top left, #2D1B69 0%, #C0392B 50%, #FF6600 100%)',
        'ember-gradient': 'linear-gradient(135deg, #FF6600 0%, #E85D04 100%)',
        'ink-gradient': 'linear-gradient(160deg, #1A3557 0%, #152238 70%)',
      },
      maxWidth: {
        content: '1100px',
        shell: '1280px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s cubic-bezier(0.34, 1.3, 0.64, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
