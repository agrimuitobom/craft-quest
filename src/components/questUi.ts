import type { QuestProgress, QuestStatus, Tier } from "@/types/quest";

export const TIER_LABEL: Record<Tier, { label: string; className: string }> = {
  beginner: { label: "初級", className: "bg-grass-500 text-white" },
  intermediate: { label: "中級", className: "bg-gold-400 text-stone-900" },
  advanced: { label: "上級", className: "bg-redstone-500 text-white" },
};

export const STATUS_LABEL: Record<QuestStatus, string> = {
  locked: "ロック中",
  available: "受注できる！",
  in_progress: "挑戦中",
  verifying: "確認中",
  cleared: "クリア",
  mastered: "マスター",
};

/** 星の数：マスター=3 / ヒント1段階まで=2 / それ以外=1 */
export function starsOf(status: QuestStatus, qp?: QuestProgress) {
  if (status === "mastered") return 3;
  if (status !== "cleared") return 0;
  return (qp?.hintsOpened ?? 0) <= 1 ? 2 : 1;
}
