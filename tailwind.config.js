/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.{html,js}',            
    './src/**/*.{html,js}',      
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#774fff', // Custom Blue
        lilac: {
          100: '#E6D7FF', // Light Lilac
          200: '#D1B2FF', // Lighter Lilac
          300: '#B69CFF', // Medium Lilac
          400: '#9B85FF', // Darker Lilac
          500: '#7A5AFF', // Main Lilac
          600: '#5F45D8', // Darker Lilac
        },
        'green': {
          500: '#28a745', // Custom Green for Button
          600: '#218838', // Darker Green for hover state
        }
      },
    },
  },
  plugins: [],
}