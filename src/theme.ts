// `primary` is a gradient — only ever use it for `background`/`backgroundImage`.
// Anything else (border-color, outline-color, text color, SVG fill/stroke)
// must use `primarySolid` instead; a gradient string is not valid CSS there
// and the whole declaration gets silently dropped by the browser.
export const colors = {
  primary: "linear-gradient(135deg, #4A63C7, #1B3A8C)",
  primarySolid: "#1B3A8C",
  secondary: "#2E2A24",
  accent: "#B8863A",
  background: "#FAF6EF",
  surface: "#FFFFFF",
  text: "#211E1A",
  textMuted: "#7A7166",
  textSubtle: "#6B6259",
  textFaint: "#847A6C",
  textLight: "#FFFFFF",
  error: "#C1432E",
  border: "#E4DCCB",
  borderSubtle: "rgba(184, 160, 120, 0.3)",
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
    fontFamily: family, // was 'DMSans-Regular'
    fontSize: 16,
    fontWeight: 400 as const,
    lineHeight: 1.5,
  },
  button: {
    fontFamily: family, // was 'DMSans-Medium'
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
