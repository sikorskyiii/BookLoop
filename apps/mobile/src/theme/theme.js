export const theme = {
  colors: {
    active:"#fff",
    inactive:"#C7C1C3",
    bg: "#F6F2EA",         
    card: "#F7F1E8",     
    text: "#2E2728",        
    textMuted: "#8F857C",   
    primary: "#B4876B",     
    primaryMuted: "#D7C2B6",
    border: "#E6DED5",
    danger: "#E15C5C",
    nav:"#95897D",
    ink: "#2E2728",             
    paper: "#F6F2EA",           
    accentWarm: "#9A6B52",      
    fieldBg: "#2E2728",        
    fieldText: "#EEE9E3",
    fieldPlaceholder: "#B8B0AA",
    googleBtn: "#2E2728",

    entryA: "#F9E4BE",
    entryB: "#F2B6A0"
  },

  radius: { xs: 6, sm: 8, md: 12, lg: 16, xl: 24, pill: 28, full: 999 },
  spacing: (n) => 4 * n,

  shadow: {
    card: { shadowColor: "#000", shadowOpacity: 0.12, shadowOffset: { width: 0, height: 8 }, shadowRadius: 12, elevation: 6 },
    soft: { shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 3 }
  },

  z: { header: 10, fab: 20, modal: 30 }
};
