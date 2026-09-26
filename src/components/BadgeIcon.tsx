import { Brain, Castle, Construction, Crown, Flame, Footprints, Pyramid, Repeat, Route, Sparkles, Wheat, type LucideIcon } from "lucide-react";
import type { Badge } from "@/types/quest";

const ICONS: Record<Badge["icon"], LucideIcon> = { Footprints, Repeat, Construction, Pyramid, Wheat, Route, Castle, Sparkles, Flame, Brain, Crown };

export function BadgeIcon({ badge, earned = true, size = 28 }: { badge: Badge; earned?: boolean; size?: number }) {
  const Icon = ICONS[badge.icon];
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg shadow-block"
      style={{
        width: size * 2,
        height: size * 2,
        background: earned ? badge.color : "#3f444c",
        filter: earned ? undefined : "grayscale(1)",
      }}
    >
      <Icon size={size} color={earned ? "#1e2126" : "#6b7280"} strokeWidth={2.5} aria-hidden />
    </span>
  );
}
