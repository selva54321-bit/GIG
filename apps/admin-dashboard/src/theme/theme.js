export const COLORS = {
  bg: "#060D1F",
  surface: "#0D1B35",
  card: "#112040",
  border: "#1E3A6E",
  accent: "#FF6B35",
  gold: "#F5A623",
  green: "#10B981",
  red: "#EF4444",
  blue: "#3B82F6",
  text: "#E8F0FF",
  muted: "#6B8CC7",
  purple: "#8B5CF6",
};

export const s = {
  app: { fontFamily: "'Sora', 'DM Sans', sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text, display: "flex" },
  card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 },
  btn: { background: COLORS.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" },
  btnGhost: { background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px 20px", fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" },
  input: { background: "#0A1628", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px", color: COLORS.text, fontFamily: "'Sora', sans-serif", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  tag: (color) => ({ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700 }),
  stat: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 4 },
};

export const tierColors = { Bronze: "#CD7F32", Silver: "#94A3B8", Gold: "#F5A623", Platinum: "#A855F7" };
export const tierNext = { Bronze: "Silver", Silver: "Gold", Gold: "Platinum" };
export const tierThreshold = { Bronze: 100, Silver: 300, Gold: 600, Platinum: 1000 };
