// Colour
export const Colors = {
  // Purples
  purple: '#7260CC',
  lightPurple: '#EFEFFF',
  brightPurple: '#8E78FF',
  purpleStroke: '#C3B7FF',
  // Oranges
  orange: '#FF890C',
  lightOrange: '#FFA341',
  // Neutrals
  black: '#000000',
  white: '#FFFFFF',
  grey: '#B2B1B8',
  lightGrey: '#F6F6F6',
  darkGrey: '#646466',
  // Signals
  blue: '#6FCEFD',
  green: '#7CD23E',
  yellow: '#FFE554',
  red: '#E83B4D',
};

// Font
export const Fonts = {
  medium: 'Montserrat-Medium',
  semibold: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
  extrabold: 'Montserrat-ExtraBold',
};

// Typography styles
export const Typography = {
  h1: { fontFamily: Fonts.bold, fontSize: 24, lineHeight: 28 },
  h2: { fontFamily: Fonts.bold, fontSize: 20, lineHeight: 24 },
  h3: { fontFamily: Fonts.semibold, fontSize: 18, lineHeight: 22 },
  subhead1: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 20 },
  subhead2: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 20 },
  body: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 18 },
  bodyBold: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 18 },
  label: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 19 },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12, // related
  lg: 28, // unrelated
  xl: 40, // header top padding
};

// Shadows
export const Shadow = {
  cardShadow: {
    shadowColor: '#C3B7FF',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4.8,
    elevation: 3, // for Android
  },
};

// Border Radius
export const Radius = {
  card: 10,
  search: 35,
  button: 40,
};

export const Layout = {
  width: '90%',
};

export const Padding = {
  buttonSm: { paddingVertical: 8, paddingHorizontal: 16 },
  buttonMd: { paddingVertical: 10, paddingHorizontal: 20 },
  buttonLg: { paddingVertical: 14, paddingHorizontal: 28 },
};

export const Theme = {
  colors: Colors,
  typography: Typography,
  fonts: Fonts,
  spacing: Spacing,
  shadow: Shadow,
  radius: Radius,
  layout: Layout,
  padding: Padding,
};

export default Theme;
