/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Roboto', 'sans-serif']
      },
      colors: {
        primaryDarkBlue: '#2F5988',
        primarySkyBlue: '#80AFE5',
        primaryBlue: '#A3C1E2',
        buttonBiGray: '#708FA4',
        buttonGray: '#D1D1D1',
        buttonYellow: '#FAE635',
        accentYellow: '#FDA50F',
        accentRed: '#F60000',
        accentGreen: '#00F653',
        accentGray: '#94959A',
        accentOrangeGray: '#59534A',
        accentLightBlue: '#C7CEFF',
        accentPurple: '#5A6ACF',
        accentDarkGreen: '#118B3E',
        textBlack2: '#1F1F1F',
        textBlack3: '#6A6A6A',
        hoverDarkBlue: '#3B6FA8'
      }
    }
  },
  plugins: []
}
