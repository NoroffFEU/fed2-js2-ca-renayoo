/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.{html,js}',            
    './src/**/*.{html,js}',      
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#774fff',  
      },
      spacing: {
        '128': '32rem', 
      },
    },
  },
  plugins: [],
}
