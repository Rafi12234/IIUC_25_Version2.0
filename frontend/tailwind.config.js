/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Theme is permanently dark by design — no toggle.
  theme: {
    extend: {
      colors: {
        'bg-base': '#0B0E1C',
        'bg-section': '#11152B',
        primary: '#A855F7',
        'primary-light': '#C084FC',
        'primary-dark': '#7C3AED',
        'accent-pink': '#D500F9',
        'accent-blue': '#4F46E5',
        'text-main': '#FFFFFF',
        'text-muted': '#B3B3C7',
      },
      backgroundImage: {
        'card-gradient': "linear-gradient(90deg, #6A00F5 0%, #D500F9 100%)",
        'section-gradient': "linear-gradient(180deg, #0B0E1C 0%, #161A34 100%)",
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'lg': '16px',
        'xl': '20px',
      },
      boxShadow: {
        'neon-soft': '0 6px 30px rgba(10, 8, 30, 0.6)',
        'neon-glow': '0 0 30px rgba(168,85,247,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(18px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.96' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
