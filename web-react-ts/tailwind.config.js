/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F3ED',
        'bg-alt': '#EDE7DB',
        card: '#FFFFFF',
        primary: {
          DEFAULT: '#2D6A4F',
          light: '#40916C',
          dark: '#1B4332',
          soft: '#D8F3DC',
        },
        accent: {
          DEFAULT: '#D4A24E',
          light: '#E8C87A',
        },
        danger: {
          DEFAULT: '#C1292E',
          light: '#F8D7DA',
        },
        warning: {
          DEFAULT: '#D4A24E',
          light: '#FFF3CD',
        },
        success: {
          DEFAULT: '#2D6A4F',
          light: '#D4EDDA',
        },
        ink: {
          DEFAULT: '#2C2C2C',
          muted: '#6B6B6B',
          light: '#9A9A9A',
        },
        line: '#E0D8CC',
      },
      fontFamily: {
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 2px 10px rgba(27, 67, 50, 0.06)',
        float: '0 12px 32px rgba(27, 67, 50, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
