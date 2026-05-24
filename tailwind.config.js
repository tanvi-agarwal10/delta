/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0D1117', // Background
          800: '#161B22', // Surface
          700: '#1F2937', // Secondary Surface
          600: '#2A3441', // Border
        },
        accent: {
          500: '#6366F1', // Primary Accent
          600: '#7C83FF', // Hover Accent
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        txt: {
          primary: '#F3F4F6',
          secondary: '#9CA3AF',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
