import type { SolvedBy, StuckPoint } from "@/types/quest";

// ============================================================
// クリア時のふりかえり（メタ認知）の選択肢
// 「どこでつまずいたか」「どうのりこえたか」を自分のことばで意識させる
// ============================================================

export const STUCK_OPTIONS: { id: StuckPoint; label: string }[] = [
  { id: "none", label: "つまずかなかった" },
  { id: "goal", label: "なにをすればいいか" },
  { id: "code", label: "コードの書きかた" },
  { id: "game", label: "マイクラでのうごき" },
  { id: "bug", label: "うまくうごかない・エラー" },
];

export const SOLVED_OPTIONS: { id: SolvedBy; label: string }[] = [
  { id: "self", label: "自分でためした" },
  { id: "reread", label: "コードを見なおした" },
  { id: "hint", label: "ヒントを見た" },
  { id: "friend", label: "友だちとそうだん" },
  { id: "teacher", label: "先生にきいた" },
];

export const stuckLabel = (id?: StuckPoint) => STUCK_OPTIONS.find((o) => o.id === id)?.label ?? "";
export const solvedLabel = (id?: SolvedBy) => SOLVED_OPTIONS.find((o) => o.id === id)?.label ?? "";
