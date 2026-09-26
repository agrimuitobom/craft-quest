import type { Badge, Unlockable } from "@/types/quest";

export const BADGES: Badge[] = [
  { id: "first-step", name: "はじめの一歩", description: "はじめてクエストを受注した", icon: "Footprints", color: "#7bc74d" },
  { id: "loop-starter", name: "ループの芽", description: "「村の柵」をクリア", icon: "Repeat", color: "#4fd8d2" },
  { id: "pyramid-architect", name: "砂漠の建築家", description: "「ピラミッド」をクリア", icon: "Pyramid", color: "#ffd23f" },
  { id: "maze-runner", name: "迷宮ランナー", description: "「地下迷宮」をクリア", icon: "Route", color: "#ef5350" },
  { id: "self-debugger", name: "セルフデバッガー", description: "ヒントを使わずにクリア", icon: "Brain", color: "#b388ff" },
  { id: "persistent", name: "あきらめない心", description: "3 回以上の報告でクリア（失敗は成長のもと！）", icon: "Sparkles", color: "#ff8a65" },
  { id: "streak-3", name: "3日連続ログイン", description: "3 日続けて学習した", icon: "Flame", color: "#ff7043" },
  { id: "all-clear", name: "ワールドの英雄", description: "すべてのクエストをクリア", icon: "Crown", color: "#f5b700" },
];

export const UNLOCKABLES: Unlockable[] = [
  { id: "novice", type: "title", name: "見習いエージェント使い", requirement: "はじめから" },
  { id: "loop-crafter", type: "title", name: "ループ職人", requirement: "「村の柵」クリア" },
  { id: "labyrinth-sage", type: "title", name: "迷宮の賢者", requirement: "「地下迷宮」クリア" },
  { id: "debug-hero", type: "title", name: "デバッグ勇者", requirement: "Lv.5 到達" },
  { id: "classic", type: "skin", name: "クラシック", palette: { body: "#4fd8d2", accent: "#2d3137" }, requirement: "はじめから" },
  { id: "gold", type: "skin", name: "ゴールド", palette: { body: "#ffd23f", accent: "#8b5e34" }, requirement: "「ピラミッド」クリア" },
  { id: "redstone", type: "skin", name: "レッドストーン", palette: { body: "#ef5350", accent: "#1e2126" }, requirement: "Lv.4 到達" },
  { id: "diamond", type: "skin", name: "ダイヤモンド", palette: { body: "#8ef0ec", accent: "#1fb5ae" }, requirement: "すべてマスター（ヒントなしクリア）" },
];

/** レベルごとの必要累計EXP（index = level-1） */
export const LEVEL_TABLE = [0, 100, 250, 450, 700, 1000, 1400, 1900];

export function levelFromExp(exp: number) {
  let level = 1;
  for (let i = 0; i < LEVEL_TABLE.length; i++) if (exp >= LEVEL_TABLE[i]) level = i + 1;
  const cur = LEVEL_TABLE[level - 1];
  const next = LEVEL_TABLE[level] ?? cur + 600;
  return { level, cur, next, ratio: Math.min(1, (exp - cur) / (next - cur)) };
}

/** レベル到達で解放されるもの */
export const LEVEL_UNLOCKS: Record<number, { type: "title" | "skin"; id: string }[]> = {
  4: [{ type: "skin", id: "redstone" }],
  5: [{ type: "title", id: "debug-hero" }],
};
