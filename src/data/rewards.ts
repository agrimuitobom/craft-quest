import type { Badge, Unlockable } from "@/types/quest";

export const BADGES: Badge[] = [
  { id: "first-step", name: "はじめの一歩", description: "はじめてクエストを受注した", icon: "Footprints", color: "#7bc74d" },
  { id: "loop-starter", name: "ループの芽", description: "「村の柵」をクリア", icon: "Repeat", color: "#4fd8d2" },
  { id: "bridge-builder", name: "橋の職人", description: "「谷にかける橋」をクリア", icon: "Construction", color: "#c49a6c" },
  { id: "torch-bearer", name: "夜道の番人", description: "「夜道にたいまつをならべよ」をクリア", icon: "FlameKindling", color: "#ffb74d" },
  { id: "shepherd", name: "羊かい", description: "「羊のかこいをつくれ」をクリア", icon: "Fence", color: "#e0e0e0" },
  { id: "lumberjack", name: "木こり", description: "「木こりエージェント」をクリア", icon: "Axe", color: "#8d6e63" },
  { id: "pyramid-architect", name: "砂漠の建築家", description: "「ピラミッド」をクリア", icon: "Pyramid", color: "#ffd23f" },
  { id: "lucky-roller", name: "運だめし名人", description: "「運だめしの祭壇」をクリア", icon: "Dices", color: "#64b5f6" },
  { id: "farm-engineer", name: "畑の技師", description: "「水路つきの畑」をクリア", icon: "Wheat", color: "#9ccc65" },
  { id: "maze-runner", name: "迷宮ランナー", description: "「地下迷宮」をクリア", icon: "Route", color: "#ef5350" },
  { id: "castle-lord", name: "城のあるじ", description: "「関数で城を建てよ」をクリア", icon: "Castle", color: "#90a4ae" },
  { id: "rainbow-maker", name: "虹のかけ手", description: "「虹の道をつくれ」をクリア", icon: "Rainbow", color: "#f48fb1" },
  { id: "town-builder", name: "町づくりの名人", description: "「関数で町をつくれ」をクリア", icon: "House", color: "#ffcc80" },
  { id: "self-debugger", name: "セルフデバッガー", description: "ヒントを使わずにクリア", icon: "Brain", color: "#b388ff" },
  { id: "persistent", name: "あきらめない心", description: "3 回以上の報告でクリア（失敗は成長のもと！）", icon: "Sparkles", color: "#ff8a65" },
  { id: "streak-3", name: "3日連続ログイン", description: "3 日続けて学習した", icon: "Flame", color: "#ff7043" },
  { id: "all-clear", name: "ワールドの英雄", description: "すべてのクエストをクリア", icon: "Crown", color: "#f5b700" },
];

export const UNLOCKABLES: Unlockable[] = [
  { id: "novice", type: "title", name: "見習いエージェント使い", requirement: "はじめから" },
  { id: "loop-crafter", type: "title", name: "ループ職人", requirement: "「村の柵」クリア" },
  { id: "bridge-master", type: "title", name: "橋の名人", requirement: "「谷にかける橋」クリア" },
  { id: "forest-ranger", type: "title", name: "森の番人", requirement: "「木こりエージェント」クリア" },
  { id: "labyrinth-sage", type: "title", name: "迷宮の賢者", requirement: "「地下迷宮」クリア" },
  { id: "castle-architect", type: "title", name: "城の設計士", requirement: "「関数で城を建てよ」クリア" },
  { id: "town-mayor", type: "title", name: "町長", requirement: "「関数で町をつくれ」クリア" },
  { id: "debug-hero", type: "title", name: "デバッグ勇者", requirement: "Lv.5 到達" },
  { id: "craft-master", type: "title", name: "クラフトマスター", requirement: "Lv.8 到達" },
  { id: "classic", type: "skin", name: "クラシック", palette: { body: "#4fd8d2", accent: "#2d3137" }, requirement: "はじめから" },
  { id: "gold", type: "skin", name: "ゴールド", palette: { body: "#ffd23f", accent: "#8b5e34" }, requirement: "「ピラミッド」クリア" },
  { id: "emerald", type: "skin", name: "エメラルド", palette: { body: "#3ddc84", accent: "#1b5e20" }, requirement: "「水路つきの畑」クリア" },
  { id: "lapis", type: "skin", name: "ラピスラズリ", palette: { body: "#3f6fd8", accent: "#1a237e" }, requirement: "「運だめしの祭壇」クリア" },
  { id: "redstone", type: "skin", name: "レッドストーン", palette: { body: "#ef5350", accent: "#1e2126" }, requirement: "Lv.4 到達" },
  { id: "netherite", type: "skin", name: "ネザライト", palette: { body: "#4a4043", accent: "#b39ddb" }, requirement: "Lv.10 到達" },
  { id: "diamond", type: "skin", name: "ダイヤモンド", palette: { body: "#8ef0ec", accent: "#1fb5ae" }, requirement: "すべてマスター（ヒントなしクリア）" },
];

/** レベルごとの必要累計EXP（index = level-1） */
export const LEVEL_TABLE = [0, 100, 250, 450, 700, 1000, 1400, 1800, 2300, 2900, 3600];

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
  8: [{ type: "title", id: "craft-master" }],
  10: [{ type: "skin", id: "netherite" }],
};
