/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#EEF5FB',
        brand: {
          blue: '#1597E5',
          secondary: '#1E88E5',
        },
        accent: {
          green: '#23C16B',
          purple: '#8B5CF6',
          red: '#EF4444',
          orange: '#F59E0B',
        },
        dark: '#0F172A',
        secondaryText: '#64748B',
      },
      borderRadius: {
        'card': '24px',
        'btn': '20px',
        'input': '20px',
      },
      boxShadow: {
        'neumorphic-sm': '3px 3px 6px #d1d8dd, -3px -3px 6px #ffffff',
        'neumorphic': '6px 6px 12px #d1d8dd, -6px -6px 12px #ffffff',
        'neumorphic-lg': '10px 10px 20px #d1d8dd, -10px -10px 20px #ffffff',
        'neumorphic-inset': 'inset 3px 3px 6px #d1d8dd, inset -3px -3px 6px #ffffff',
      },
    },
  },
  plugins: [],
}
