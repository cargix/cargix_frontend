/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#1E3A8A',
        },
        accent: {
          DEFAULT: '#F97316',
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          400: '#fb923c',
          600: '#ea580c',
        },
        success: { DEFAULT: '#10B981', light: '#d1fae5', dark: '#065f46' },
        warning: { DEFAULT: '#F59E0B', light: '#fef3c7', dark: '#92400e' },
        danger:  { DEFAULT: '#EF4444', light: '#fee2e2', dark: '#991b1b' },
        dark: {
          bg:     '#0F172A',
          card:   '#1E293B',
          card2:  '#162032',
          border: '#334155',
          muted:  '#64748B',
        },
        light: {
          bg:     '#F8FAFC',
          card:   '#FFFFFF',
          border: '#E2E8F0',
          muted:  '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
        'card-md':  '0 4px 12px rgba(0,0,0,0.10)',
        'card-lg':  '0 10px 30px rgba(0,0,0,0.14), 0 4px 10px rgba(0,0,0,0.08)',
        glass:      '0 8px 32px rgba(0,0,0,0.12)',
        glow:       '0 0 20px rgba(30,58,138,0.3)',
        'glow-accent': '0 0 20px rgba(249,115,22,0.4)',
      },
      animation: {
        shimmer:    'shimmer 1.6s linear infinite',
        'fade-in':  'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        float:      'float 3s ease-in-out infinite',
        pulse2:     'pulse2 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-primary': 'linear-gradient(135deg, #1E3A8A 0%, #1e40af 50%, #1d4ed8 100%)',
        'mesh-accent':  'linear-gradient(135deg, #F97316 0%, #fb923c 100%)',
      },
    },
  },
  plugins: [],
};
