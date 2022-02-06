module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    {
      pattern: /(bg|text|border)-(primary|secondary)(-(light|dark|transparent))?/,
      variants: ['hover'],
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#42A2F0',
          DEFAULT: '#2191ED',
          dark: '#107CE8',
          transparent: '#107CE822',
        },
        secondary: {
          light: '#14E1BF',
          DEFAULT: '#2CC9A7',
          dark: '#3EBDA1',
          transparent: '#3EBDA122',
        },
        error: {
          DEFAULT: '#D06262',
        },
      },
      animation: {
        blink: 'blink 1s linear infinite',
        load: 'load 1s infinite linear',
      },
      keyframes: {
        blink: {
          '0%, 49%, 100%': { opacity: 1 },
          '50%, 99%': { opacity: 0 },
        },
        load: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-1.75rem)' },
        },
      },
      width: { '3/2': '150%' },
    },
  },
  plugins: [],
};
