/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        nothing: {
          black: '#0a0a0a',
          surface: '#ffffff',
          card: '#ffffff',
          bg: '#f7f7f5',
          border: '#0a0a0a',
          muted: '#737373',
          dim: '#525252',
          subtle: '#e5e5e5',
        },
      },
      boxShadow: {
        brutal: '3px 3px 0 #0a0a0a',
        'brutal-sm': '2px 2px 0 #0a0a0a',
      },
    },
  },
  plugins: [],
};
