/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.{html,js}',            
    './src/**/*.{html,js}',      
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#af2d00',  
      },
      spacing: {
        '128': '32rem', 
      },
    },
  },
  plugins: [],
}
