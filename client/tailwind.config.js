module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#14E1BF',
          DEFAULT: '#2CC9A7',
          dark: '#3EBDA1',
        },
        secondary: {
          DEFAULT: '#2191ED',
          dark: '#107CE8',
        },
      },
      animation: {
        blink: 'blink 1s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 49%, 100%': { opacity: 1 },
          '50%, 99%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
