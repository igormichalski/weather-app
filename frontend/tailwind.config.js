/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        night: {
          400: '#8b8fa8',
          500: '#6b7090',
          600: '#4a5068',
          700: '#2e3450',
          800: '#1a2040',
          900: '#0f1530',
          950: '#070b1a',
        },
        aurora: {
          cyan:   '#22d3ee',
          violet: '#a78bfa',
          teal:   '#2dd4bf',
          pink:   '#f472b6',
        },
      },
    },
  },
  plugins: [],
}
