/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Blackbaud brand accent (deep blue). Used sparingly for brand chrome;
        // the alignment taxonomy uses its own semantic palette (see AlignmentChip).
        bb: {
          blue: '#2c3e8c',
          dark: '#1f2d66',
          accent: 'var(--bb-accent)',
          light: '#e6e9f5',
        },
        surface: {
          bg: 'var(--surface-bg)',
          card: 'var(--surface-card)',
          'card-hover': 'var(--surface-card-hover)',
          border: 'var(--surface-border)',
          'border-light': 'var(--surface-border-light)',
        },
        th: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
          inverse: 'var(--text-inverse)',
        },
      },
      fontFamily: {
        sans: ["'Inter'", 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
