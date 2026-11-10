/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <-- Add this line here
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#157347',      // Forest Green
          dark: '#0F5132',         // Dark Forest
          hover: '#0D4428',        // Brand Primary Hover
          accent: '#10B981',       // Accent Green / Money In
          accentLight: '#D1FAE5',  // Light Green tint
          danger: '#EF4444',       // Danger / Money Out / Red
          dangerLight: '#FEE2E2',  // Light Red tint
          bg: '#F8F9FA',           // Background Light
          surface: '#FFFFFF',      // Card Surface
          muted: '#6B7280',        // Inactive / Muted Text
          darkText: '#111827',     // Heading / Dark Text
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};