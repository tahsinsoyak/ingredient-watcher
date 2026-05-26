import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './popup.html', './options.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#0F172A',
          elevated: '#1E293B',
        },
        page: {
          light: '#F8FAFC',
          dark: '#020617',
        },
        severity: {
          warning: '#F59E0B',
          'warning-dark': '#FBBF24',
          notice: '#2563EB',
          'notice-dark': '#60A5FA',
          info: '#16A34A',
          'info-dark': '#22C55E',
          danger: '#EF4444',
          'danger-dark': '#F87171',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      scale: {
        '98': '0.98',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-highlight': 'pulseHighlight 1.5s ease-in-out 2',
        shimmer: 'shimmer 1.5s infinite',
        'scale-in': 'scaleIn 0.15s ease-out',
        'check-pop': 'checkPop 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseHighlight: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(22, 163, 74, 0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(22, 163, 74, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        checkPop: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
