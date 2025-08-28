export const theme = {
  colors: {
    bg: "#0f1115",
    card: "#171a20",
    text: "#e6e8ee",
    textMuted: "#9aa3b2",
    primary: "#7c5cff",
    primaryMuted: "#b2a4ff",
    border: "#232734",
    danger: "#ff6b6b"
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24 },
  spacing: (n) => 4 * n,
  shadow: {
    card: {
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 12,
      elevation: 6
    }
  }
};
