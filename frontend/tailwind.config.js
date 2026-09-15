/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sanket-bg': '#E8EEE1',
        'sanket-sage': '#9CB67B',
        'sanket-olive': '#B8C99F',
        'sanket-charcoal': '#252525',
        'sanket-white': '#FFFFFF',
        'sanket-beige': '#F5F5DC', // Warm off-white / beige
        
        // Risk Severity Colors (Slightly muted, professional tones)
        'risk-low': '#4CAF50',       // Muted Green
        'risk-moderate': '#FFB300',  // Muted Amber/Yellow
        'risk-high': '#F57C00',      // Muted Orange
        'risk-critical': '#D32F2F',  // Muted Red
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
