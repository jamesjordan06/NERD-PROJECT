/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",        // your App Router files
    "./components/**/*.{js,jsx,ts,tsx}", // shared UI components
    "./lib/**/*.{js,ts}",                // any helpers that embed class names
  ],
  theme: {
    extend: {
      colors: {
        spacex: {
          DEFAULT: '#0B0D17', // deep space black
          blue: '#0057FF',    // SpaceX blue
        },
        'spacex-gray': '#D0D6F9', // light gray for text
        primary: {
          DEFAULT: '#0057FF',
        },
        background: '#0B0D17',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
