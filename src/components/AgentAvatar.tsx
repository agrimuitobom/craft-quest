import { UNLOCKABLES } from "@/data/rewards";

/** ピクセルアートのエージェント（スキンで配色が変わる） */
export function AgentAvatar({ skin = "classic", size = 48, bob = false }: { skin?: string; size?: number; bob?: boolean }) {
  const palette = UNLOCKABLES.find((u) => u.id === skin)?.palette ?? { body: "#4fd8d2", accent: "#2d3137" };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={bob ? "animate-bob" : undefined}
      role="img"
      aria-label="エージェント"
    >
      <rect x="3" y="1" width="10" height="9" fill={palette.body} />
      <rect x="4" y="3" width="8" height="5" fill={palette.accent} />
      <rect x="5" y="4" width="2" height="2" fill="#fff" />
      <rect x="9" y="4" width="2" height="2" fill="#fff" />
      <rect x="4" y="10" width="8" height="4" fill={palette.body} />
      <rect x="2" y="10" width="2" height="3" fill={palette.accent} />
      <rect x="12" y="10" width="2" height="3" fill={palette.accent} />
      <rect x="5" y="14" width="2" height="2" fill={palette.accent} />
      <rect x="9" y="14" width="2" height="2" fill={palette.accent} />
    </svg>
  );
}
