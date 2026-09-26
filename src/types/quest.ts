// ============================================================
// クエスト / 進捗 / リワードの型定義
// docs/quest.schema.json と 1:1 で対応させています
// ============================================================

export type Language = "makecode" | "python";

export type Tier = "beginner" | "intermediate" | "advanced";

/** 学習する概念タグ（バッジ判定やフィルタに使用） */
export type Concept =
  | "sequence" // 順次
  | "loop" // くりかえし
  | "nested-loop" // 二重ループ
  | "variable" // 変数
  | "condition" // 条件分岐
  | "function" // 関数
  | "event" // イベント（チャットコマンド）
  | "algorithm"; // アルゴリズム

/** NPC のセリフ（ストーリー演出） */
export interface NpcLine {
  npc: "villager" | "blacksmith" | "sage" | "agent";
  text: string;
}

/** ブロックプレビュー用の木構造（MakeCode のブロックを簡易表現） */
export interface BlockNode {
  /** 見た目の色分けに使うカテゴリ（MakeCode の色に準拠） */
  category: "player" | "agent" | "loops" | "logic" | "variables" | "blocks" | "functions" | "positions";
  label: string;
  /** 「〇〇」の部分を空欄にして生徒に考えさせる場合 true */
  blank?: boolean;
  children?: BlockNode[];
  /** if/else の else 側 */
  elseChildren?: BlockNode[];
}

/** 3段階ヒント。答えではなく「バグを見つける視点」を与える */
export interface Hint {
  level: 1 | 2 | 3;
  /** 1:気づき(観察) / 2:焦点(どこを見る) / 3:具体(部分的なコード) */
  kind: "observe" | "focus" | "partial";
  title: string;
  body: string;
  /** レベル3のみ：穴あきのコード片 */
  snippet?: string;
}

/**
 * 自動検証ルール。
 * マイクラEEとはAPI連携しないため「貼り付けたコードの静的チェック」
 * ＋「ゲーム内で確認できた結果のセルフチェック」の2層で判定する。
 */
export type ValidationRule =
  | { type: "contains"; pattern: string; flags?: string; message: string }
  | { type: "notContains"; pattern: string; flags?: string; message: string }
  | { type: "minCount"; pattern: string; flags?: string; min: number; message: string }
  | { type: "maxCount"; pattern: string; flags?: string; max: number; message: string };

export interface Validation {
  /**
   * コード静的チェック。MakeCode Python 形式のテキストに対して適用。
   * ブロックで作った子は MakeCode 右上の「Python」タブに切り替えてコピーする。
   */
  codeRules: ValidationRule[];
  /** ゲーム内で目で見て確認する項目（全部チェックでクリア） */
  observations: string[];
}

export interface QuestReward {
  exp: number;
  /** ヒント未使用でクリアした場合のボーナスEXP */
  noHintBonus: number;
  badgeId?: string;
  unlock?: { type: "title" | "skin"; id: string };
}

export interface Quest {
  id: string;
  /** ワールドマップ上のエリア */
  area: "meadow" | "village" | "desert" | "cave";
  tier: Tier;
  order: number;
  title: string;
  /** マップ上の座標（%指定。レスポンシブで崩れない） */
  mapPos: { x: number; y: number };
  prerequisites: string[];
  concepts: Concept[];
  estimatedMinutes: number;
  story: NpcLine[];
  objective: string;
  /** 達成条件を箇条書きで（子ども向けの言葉で） */
  goals: string[];
  starter: {
    /** マイクラ側の準備（ワールド設定・コマンド） */
    worldSetup: string[];
    blocks: BlockNode[];
    python: string;
  };
  hints: Hint[];
  validation: Validation;
  reward: QuestReward;
  /** 模範解答（教師モードでのみ表示） */
  solution: { python: string; blocksNote: string };
}

// ---------------- 進捗 ----------------

/**
 * クエスト状態遷移
 * locked ──(前提クリア)──▶ available ──(受注)──▶ in_progress
 * in_progress ──(報告)──▶ verifying ──(NG)──▶ in_progress
 *                                   └─(OK)──▶ cleared ──(ヒント0で再クリア)──▶ mastered
 */
export type QuestStatus = "locked" | "available" | "in_progress" | "verifying" | "cleared" | "mastered";

/** クリア時のふりかえり（メタ認知）。選択肢の文言は src/data/reflection.ts */
export type StuckPoint = "none" | "goal" | "code" | "game" | "bug";
export type SolvedBy = "self" | "hint" | "reread" | "friend" | "teacher";
export interface Reflection {
  stuck: StuckPoint;
  /** stuck が "none" のときはなし */
  solved?: SolvedBy;
  /** つぎに使えそうなこと（任意・60 文字まで） */
  note?: string;
  at: string;
}

export interface QuestProgress {
  status: QuestStatus;
  hintsOpened: number; // 開いたヒントの最大レベル(0-3)
  attempts: number; // 報告（検証）した回数
  startedAt?: string;
  clearedAt?: string;
  bestExp?: number;
  lastCode?: string;
  language: Language;
  /** いちばん新しいクリア時のふりかえり */
  reflection?: Reflection;
}

export interface UserProgress {
  version: 1;
  playerName: string;
  exp: number;
  quests: Record<string, QuestProgress>;
  badges: string[];
  titles: string[];
  skins: string[];
  equippedTitle: string;
  equippedSkin: string;
  /** 連続学習日数（継続のしかけ） */
  streak: { count: number; lastDate: string };
}

// ---------------- Firestore ----------------

/** 生徒のプロフィール（初回ログイン時に入力） */
export interface StudentProfile {
  className: string; // 例: "1年A組"
  studentNumber: number; // 出席番号
  nickname: string; // アプリ内の表示名
}

/** users/{uid} ドキュメント */
export interface StudentDoc {
  email: string;
  googleName: string;
  profile: StudentProfile;
  progress: UserProgress;
  createdAt?: unknown; // serverTimestamp
  updatedAt?: unknown;
}

/** users/{uid}/events/{id}：学習ログ（先生のつまずき分析用・追記のみ） */
export type LearningEventType = "start" | "hint" | "fail" | "clear" | "reflect";
export interface LearningEvent {
  type: LearningEventType;
  questId: string;
  hintLevel?: number;
  attempt?: number;
  exp?: number;
  /** reflect のみ（ひとことは個人の記録なのでログには入れない） */
  stuck?: StuckPoint;
  solved?: SolvedBy;
  at?: unknown;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: "Footprints" | "Repeat" | "Construction" | "Pyramid" | "Wheat" | "Route" | "Castle" | "Sparkles" | "Flame" | "Brain" | "Crown";
  color: string;
}

export interface Unlockable {
  id: string;
  type: "title" | "skin";
  name: string;
  /** skin の場合はアバターの配色 */
  palette?: { body: string; accent: string };
  requirement: string;
}
