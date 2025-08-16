/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class','[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        good: 'var(--good)',
        warn: 'var(--warn)',
        bad: 'var(--bad)',
        text: 'var(--text)',
        'text-soft': 'var(--text-soft)',
        border: 'var(--border)'
      },
      borderRadius: {
        xl: '12px'
      }
    }
  },
  plugins: []
};
