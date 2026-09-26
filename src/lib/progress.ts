import { QUESTS } from "@/data/quests";
import { LEVEL_UNLOCKS, levelFromExp } from "@/data/rewards";
import type { Language, Quest, QuestProgress, QuestStatus, UserProgress } from "@/types/quest";

// ============================================================
// 進捗の状態遷移（純粋関数）と LocalStorage 永続化
// ============================================================

export const STORAGE_KEY = "craft-quest:progress:v1";

export const initialProgress = (): UserProgress => ({
  version: 1,
  playerName: "",
  exp: 0,
  quests: {},
  badges: [],
  titles: ["novice"],
  skins: ["classic"],
  equippedTitle: "novice",
  equippedSkin: "classic",
  streak: { count: 0, lastDate: "" },
});

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") return initialProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress();
    const parsed = JSON.parse(raw) as UserProgress;
    return parsed.version === 1 ? { ...initialProgress(), ...parsed } : initialProgress();
  } catch {
    return initialProgress();
  }
}

export function saveProgress(p: UserProgress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* プライベートモード等で保存できなくても動作は継続 */
  }
}

// ---------------- 状態の導出 ----------------

/** locked / available は保存せず、前提クエストから毎回導出する */
export function getStatus(p: UserProgress, quest: Quest): QuestStatus {
  const saved = p.quests[quest.id]?.status;
  if (saved && saved !== "locked" && saved !== "available") return saved;
  const unlocked = quest.prerequisites.every((id) => isCleared(p.quests[id]?.status));
  return unlocked ? "available" : "locked";
}

export const isCleared = (s?: QuestStatus) => s === "cleared" || s === "mastered";

const blank = (language: Language): QuestProgress => ({ status: "available", hintsOpened: 0, attempts: 0, language });

function patchQuest(p: UserProgress, id: string, patch: Partial<QuestProgress>): UserProgress {
  const cur = p.quests[id] ?? blank("makecode");
  return { ...p, quests: { ...p.quests, [id]: { ...cur, ...patch } } };
}

// ---------------- 遷移 ----------------

/** available → in_progress（クリア済みの再挑戦も可） */
export function startQuest(p: UserProgress, quest: Quest, language: Language): UserProgress {
  const status = getStatus(p, quest);
  if (status === "locked") return p;
  let next = p;
  if (status === "available") {
    next = patchQuest(p, quest.id, { status: "in_progress", startedAt: new Date().toISOString(), language, hintsOpened: 0 });
  } else if (isCleared(status)) {
    // 再挑戦：ステータスは保持し、ヒント使用数だけリセット（マスター狙い）
    next = patchQuest(p, quest.id, { hintsOpened: 0, language });
  }
  if (!next.badges.includes("first-step")) next = { ...next, badges: [...next.badges, "first-step"] };
  return next;
}

export function openHint(p: UserProgress, questId: string, level: number): UserProgress {
  const cur = p.quests[questId];
  if (!cur || cur.hintsOpened >= level) return p;
  return patchQuest(p, questId, { hintsOpened: level });
}

export function setLanguage(p: UserProgress, questId: string, language: Language): UserProgress {
  return p.quests[questId] ? patchQuest(p, questId, { language }) : p;
}

/** in_progress → verifying → in_progress（NG時） */
export function recordFailedAttempt(p: UserProgress, questId: string, code: string): UserProgress {
  const cur = p.quests[questId];
  return patchQuest(p, questId, { attempts: (cur?.attempts ?? 0) + 1, lastCode: code });
}

export interface ClearReward {
  baseExp: number;
  bonusExp: number;
  totalExp: number;
  newBadges: string[];
  newUnlocks: { type: "title" | "skin"; id: string }[];
  levelBefore: number;
  levelAfter: number;
  firstClear: boolean;
  mastered: boolean;
}

/** verifying → cleared / mastered。獲得報酬も計算して返す */
export function completeQuest(p: UserProgress, quest: Quest, code: string): { next: UserProgress; reward: ClearReward } {
  const cur = p.quests[quest.id] ?? blank("makecode");
  const firstClear = !isCleared(cur.status);
  const noHint = cur.hintsOpened === 0;
  const attempts = cur.attempts + 1;

  // 初回は満額、再挑戦は「ヒントなしマスター」になったときのボーナスのみ
  const alreadyMastered = cur.status === "mastered";
  const baseExp = firstClear ? quest.reward.exp : 0;
  const bonusExp = noHint && !alreadyMastered ? quest.reward.noHintBonus : 0;
  const totalExp = baseExp + bonusExp;

  const status: QuestStatus = noHint || alreadyMastered ? "mastered" : "cleared";
  let next = patchQuest(p, quest.id, {
    status,
    attempts,
    lastCode: code,
    clearedAt: cur.clearedAt ?? new Date().toISOString(),
    bestExp: Math.max(cur.bestExp ?? 0, totalExp),
  });
  next = { ...next, exp: p.exp + totalExp };

  // バッジ判定
  const earned = new Set(next.badges);
  const newBadges: string[] = [];
  const give = (id: string) => {
    if (!earned.has(id)) {
      earned.add(id);
      newBadges.push(id);
    }
  };
  if (quest.reward.badgeId) give(quest.reward.badgeId);
  if (noHint) give("self-debugger");
  if (attempts >= 3) give("persistent");
  if (QUESTS.every((q) => isCleared(next.quests[q.id]?.status))) give("all-clear");
  next = { ...next, badges: [...earned] };

  // アンロック判定（クエスト報酬 + レベル到達 + 全マスター）
  const levelBefore = levelFromExp(p.exp).level;
  const levelAfter = levelFromExp(next.exp).level;
  const candidates: { type: "title" | "skin"; id: string }[] = [];
  if (quest.reward.unlock) candidates.push(quest.reward.unlock);
  for (let lv = levelBefore + 1; lv <= levelAfter; lv++) candidates.push(...(LEVEL_UNLOCKS[lv] ?? []));
  if (QUESTS.every((q) => next.quests[q.id]?.status === "mastered")) candidates.push({ type: "skin", id: "diamond" });

  const newUnlocks: ClearReward["newUnlocks"] = [];
  for (const u of candidates) {
    const list = u.type === "title" ? next.titles : next.skins;
    if (!list.includes(u.id)) {
      newUnlocks.push(u);
      next = u.type === "title" ? { ...next, titles: [...next.titles, u.id] } : { ...next, skins: [...next.skins, u.id] };
    }
  }

  return {
    next,
    reward: { baseExp, bonusExp, totalExp, newBadges, newUnlocks, levelBefore, levelAfter, firstClear, mastered: status === "mastered" },
  };
}

/** 連続学習日数の更新（アプリ起動時に呼ぶ） */
export function touchStreak(p: UserProgress, today = new Date()): UserProgress {
  const d = today.toLocaleDateString("sv-SE"); // YYYY-MM-DD（ローカル時刻）
  if (p.streak.lastDate === d) return p;
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  const yesterday = y.toLocaleDateString("sv-SE");
  const count = p.streak.lastDate === yesterday ? p.streak.count + 1 : 1;
  let next: UserProgress = { ...p, streak: { count, lastDate: d } };
  if (count >= 3 && !next.badges.includes("streak-3")) next = { ...next, badges: [...next.badges, "streak-3"] };
  return next;
}
