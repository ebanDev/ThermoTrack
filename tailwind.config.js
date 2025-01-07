// import konstaConfig config
const konstaConfig = require('konsta/config');

// wrap config with konstaConfig config
module.exports = konstaConfig({
  content: [
    './components/*.{js,ts,jsx,vue}',
    './pages/*.{js,ts,jsx,vue}',
    './layouts/*.{js,ts,jsx,vue}',
    './components/**/*.{js,ts,jsx,vue}',
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      material: 'Inter, system-ui, Noto, Helvetica, Arial, sans-serif',
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
  konsta: {
    colors: {
      primary: '#0056b3'
    },
  },
});
