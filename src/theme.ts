export const colors = {
  primary: "#4A90E2",
  secondary: "#34495E",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  text: "black",
  textLight: "#FFFFFF",
  error: "#E74C3C",
  border: "#BDC3C7",
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

const fontFamily = "DM Sans, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";

export const typography = {
  header: {
    fontFamily,
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  button: {
    fontFamily,
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1.2,
  },
  message: {
    fontFamily,
    fontSize: 17,
    fontWeight: 400,
    lineHeight: 1.5,
  },
} as const;


