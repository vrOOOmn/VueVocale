// Design tokens sourced directly from the "Parisian Tech" system in the
// VueVocale Unified UI System Figma file (Foundations frame, node 7:5).
// Keep these values in sync with that file — it's the source of truth.
//
// Design rules (verbatim from Figma): 1px hairlines, 12px brass plaques,
// 18px controls, 28px panels. Dark chips for recognized objects. Blue means
// action or listening. Rouge only corrects (never use rouge for anything
// other than grammar corrections / destructive confirmation).
export const colors = {
  navy: "#111B3F", // identity, headers, dark chips
  ivory: "#FAF4EA", // page background
  paper: "#FFFDF9", // panel/card surfaces
  limestone: "#E8E1D6", // secondary surfaces
  electric: "#3168FF", // primary action — blue means action or listening
  brass: "#B98A3D", // Paris accent detail (plaques, fine rules)
  rouge: "#B94A48", // correction only — never used elsewhere
  mint: "#1EA783", // success
  mist: "#EEF3F8", // AI/bot response surface
  hairline: "#D9D1C4", // 1px borders/rules
  hairlineTranslucent: "rgba(217, 209, 196, 0.5)", // hairline, for borders on frosted/translucent-white surfaces (glass pills over photos/scrolling content) where the opaque value reads too heavy

  textMuted: "#687080", // body / secondary copy
  textLabel: "#171A23", // small semibold labels
  textLight: "#FFFFFF",

  // Tech accent layer
  skyAI: "#5CC8FF",
  lavenderProgress: "#8E7CFF",
  coralSpeech: "#FF6B5F",
  citrusObject: "#F6B44B",
  deepTeal: "#087D75",
};

export const spacing = {
  xs: 4,
  sm: 8,
  smd: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 12px plaques, 18px controls, 28px panels — per Figma design rules.
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  round: 9999,
};

// Two elevation tiers, applied consistently across every white/paper card
// and pill in the app instead of each one carrying its own bespoke value.
export const shadows = {
  // Resting elevation for inline cards and pills.
  card: "0 8px 20px rgba(17, 27, 63, 0.08)",
  // Stronger elevation for anything floating above other content: modals,
  // dropdowns, slide-in panels.
  overlay: "0 20px 50px rgba(17, 27, 63, 0.16)",
};

const displayFamily = `'DM Serif Display', Georgia, serif`;
const uiFamily = `Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;

export const typography = {
  // Brand and landing hero moments only.
  display: {
    fontFamily: displayFamily,
    fontSize: 50,
    fontWeight: 400 as const,
    lineHeight: 1.15,
  },
  header: {
    fontFamily: uiFamily,
    fontSize: 24,
    fontWeight: 700 as const,
    lineHeight: 1.25,
  },
  body: {
    fontFamily: uiFamily,
    fontSize: 16,
    fontWeight: 400 as const,
    lineHeight: 1.5,
  },
  button: {
    fontFamily: uiFamily,
    fontSize: 18,
    fontWeight: 600 as const,
    lineHeight: 1.2,
  },
  message: {
    fontFamily: uiFamily,
    fontSize: 17,
    fontWeight: 400 as const,
    lineHeight: 1.5,
  },
  label: {
    fontFamily: uiFamily,
    fontSize: 13,
    fontWeight: 600 as const,
    lineHeight: 1.3,
  },
  caption: {
    fontFamily: uiFamily,
    fontSize: 12,
    fontWeight: 400 as const,
    lineHeight: 1.4,
  },
} as const;
