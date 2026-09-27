import type { LearningEventType } from "@/types/quest";

// ============================================================
// つまずき分析（純粋関数）：学習ログ（users/{uid}/events）を集計する
// 時間は「最初の start から」の経過。日をまたぐと長くなるので、平均ではなく中央値を使う
// ============================================================

export interface LogEvent {
  uid: string;
  type: LearningEventType;
  questId: string;
  hintLevel?: number;
  /** ミリ秒 */
  at: number;
}

export interface QuestStats {
  questId: string;
  started: number;
  cleared: number;
  /** 最初の start → 最初の clear（分）の中央値 */
  clearMinutes: number | null;
  /** クリアした人の、クリア前の失敗報告の平均 */
  failsBeforeClear: number | null;
  /** クリアした人のうち、クリア前にヒントを開いた割合（0〜1） */
  hintRate: number | null;
  /** ヒント 1〜3 を開くまでの時間（分）の中央値。index = 段階 - 1 */
  hintMinutes: (number | null)[];
}

export interface StuckStudent {
  uid: string;
  questId: string;
  /** 最初の start → 最後の操作（分） */
  workedMinutes: number;
  fails: number;
  hintLevel: number;
  lastAt: number;
  /** 声かけ候補（失敗 3 回以上・ヒント 3・同じクエストの中央値の 2 倍以上かかっている） */
  alert: boolean;
}

export interface Analysis {
  quests: QuestStats[];
  stuck: StuckStudent[];
}

const MIN = 60_000;

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

interface Track {
  start: number;
  clear?: number;
  fails: number;
  hintAt: (number | undefined)[];
  hintLevel: number;
  lastAt: number;
}

export function analyze(events: LogEvent[], questIds: string[]): Analysis {
  // 生徒 × クエストごとに、時間順にまとめる
  const tracks = new Map<string, Track>();
  const sorted = [...events].sort((a, b) => a.at - b.at);
  for (const e of sorted) {
    if (e.type === "reflect") continue;
    const key = `${e.uid}\u0000${e.questId}`;
    let t = tracks.get(key);
    if (!t) {
      t = { start: e.at, fails: 0, hintAt: [undefined, undefined, undefined], hintLevel: 0, lastAt: e.at };
      tracks.set(key, t);
    }
    t.lastAt = e.at;
    if (t.clear !== undefined) continue; // 初回クリアのあと（再挑戦）は数えない
    if (e.type === "fail") t.fails++;
    if (e.type === "hint" && e.hintLevel && e.hintLevel >= 1 && e.hintLevel <= 3) {
      t.hintAt[e.hintLevel - 1] ??= e.at;
      t.hintLevel = Math.max(t.hintLevel, e.hintLevel);
    }
    if (e.type === "clear") t.clear = e.at;
  }

  const byQuest = new Map<string, { uid: string; t: Track }[]>();
  for (const [key, t] of tracks) {
    const [uid, questId] = key.split("\u0000");
    if (!byQuest.has(questId)) byQuest.set(questId, []);
    byQuest.get(questId)!.push({ uid, t });
  }

  const quests: QuestStats[] = questIds.map((questId) => {
    const list = byQuest.get(questId) ?? [];
    const cleared = list.filter(({ t }) => t.clear !== undefined);
    return {
      questId,
      started: list.length,
      cleared: cleared.length,
      clearMinutes: median(cleared.map(({ t }) => (t.clear! - t.start) / MIN)),
      failsBeforeClear: cleared.length ? cleared.reduce((s, { t }) => s + t.fails, 0) / cleared.length : null,
      hintRate: cleared.length ? cleared.filter(({ t }) => t.hintLevel > 0).length / cleared.length : null,
      hintMinutes: [0, 1, 2].map((i) =>
        median(list.flatMap(({ t }) => (t.hintAt[i] !== undefined ? [(t.hintAt[i]! - t.start) / MIN] : []))),
      ),
    };
  });

  const medianOf = new Map(quests.map((q) => [q.questId, q.clearMinutes]));
  const stuck: StuckStudent[] = [];
  for (const [questId, list] of byQuest) {
    for (const { uid, t } of list) {
      if (t.clear !== undefined) continue;
      const workedMinutes = (t.lastAt - t.start) / MIN;
      const med = medianOf.get(questId);
      const slow = med != null && med > 0 && workedMinutes >= med * 2;
      stuck.push({ uid, questId, workedMinutes, fails: t.fails, hintLevel: t.hintLevel, lastAt: t.lastAt, alert: t.fails >= 3 || t.hintLevel >= 3 || slow });
    }
  }
  stuck.sort((a, b) => Number(b.alert) - Number(a.alert) || b.lastAt - a.lastAt);
  return { quests, stuck };
}

/** 「12 分」「1 時間 5 分」 */
export function formatMinutes(m: number | null): string {
  if (m == null) return "-";
  const r = Math.round(m);
  if (r < 60) return `${r} 分`;
  return `${Math.floor(r / 60)} 時間${r % 60 ? ` ${r % 60} 分` : ""}`;
}
