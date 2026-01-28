module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4A6741',
        secondary: '#8AA899',
        'accent-warm': '#D4A373',
        cream: '#FDFCF8',
        'stone-surface': '#F5F2EB',
        'text-main': '#2C3333',
        'surface-dark': '#2d3f3f',
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
        full: '9999px',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        card: '0 2px 10px -2px rgba(74, 103, 65, 0.05)',
      },
    },
  },
  plugins: [],
}
