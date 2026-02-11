module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat-Regular'],
        'montserrat-medium': ['Montserrat-Medium'],
        'montserrat-semibold': ['Montserrat-SemiBold'],
        'montserrat-bold': ['Montserrat-Bold'],
        'montserrat-extrabold': ['Montserrat-ExtraBold'],
        'montserrat-black': ['Montserrat-Black'],
        'montserrat-light': ['Montserrat-Light'],
        'montserrat-thin': ['Montserrat-Thin'],
        'montserrat-extra-light': ['Montserrat-ExtraLight'],
        'montserrat-extra-bold': ['Montserrat-ExtraBold'],
        'montserrat-extra-black': ['Montserrat-ExtraBlack'],
        'montserrat-extra-light': ['Montserrat-ExtraLight'],
      },
    },
  },
  plugins: [],
};
