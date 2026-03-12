import { Badge } from "../types";
import { BADGE_STYLES } from "../constants";

export function BadgeChip({ label, type }: Badge) {
  const s = BADGE_STYLES[type] ?? BADGE_STYLES.frontrunner;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "1px",
      textTransform: "uppercase", padding: "3px 10px",
      borderRadius: 100, border: `1px solid ${s.border}`,
      background: s.bg, color: s.color, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}