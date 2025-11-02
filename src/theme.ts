export const colors = {
  primary: "linear-gradient(135deg, #4F8DFD, #3369D6)",
  secondary: '#34495E',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: 'black',
  textLight: '#FFFFFF',
  error: '#E74C3C',
  border: '#BDC3C7',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// src/theme.ts
const family = `DM Sans, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;

export const typography = {
  header: {
    fontFamily: family,
    fontSize: 24,
    fontWeight: 700 as const, // was 'DMSans-Bold'
    lineHeight: 1.25,
  },
  body: {
    fontFamily: family,       // was 'DMSans-Regular'
    fontSize: 16,
    fontWeight: 400 as const,
    lineHeight: 1.5,
  },
  button: {
    fontFamily: family,       // was 'DMSans-Medium'
    fontSize: 18,
    fontWeight: 500 as const,
    lineHeight: 1.2,
  },
  message: {
    fontFamily: family,
    fontSize: 17,
    fontWeight: 400 as const,
    lineHeight: 1.5,
  },
} as const;


