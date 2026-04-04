export const COLORS = {
  bg: "#FAF9FF", // Very light purple/white
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E9E3F4", // Soft light purple border
  accent: "#9333EA", // Vibrant but soft purple
  gold: "#F59E0B", 
  green: "#10B981", 
  red: "#EF4444", 
  blue: "#3B82F6", 
  text: "#1E1B4B", // Deep dark purple text for contrast
  muted: "#8B82A9", // Muted purple-grey
  purple: "#D8B4FE", // Light purple accent
};

export const s = {
  app: { fontFamily: "'Sora', 'DM Sans', sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text, display: "flex" },
  card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.01)" },
  btn: { background: COLORS.accent, color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  btnGhost: { background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 20px", fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s" },
  input: { background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "12px 16px", color: COLORS.text, fontFamily: "'Sora', sans-serif", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.01) inset" },
  tag: (color) => ({ background: color + "15", color, border: `1px solid ${color}33`, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700 }),
  stat: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.01)" },
};

export const tierColors = { Bronze: "#CD7F32", Silver: "#94A3B8", Gold: "#F5A623", Platinum: "#A855F7" };
export const tierNext = { Bronze: "Silver", Silver: "Gold", Gold: "Platinum" };
export const tierThreshold = { Bronze: 100, Silver: 300, Gold: 600, Platinum: 1000 };
