// つまずき分析（src/lib/analytics.ts）のテスト
// 実行: npm run test:quests（クエストのテストといっしょに動く）
import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze, formatMinutes, median, type LogEvent } from "../src/lib/analytics.ts";

const M = 60_000;
const ev = (uid: string, type: LogEvent["type"], min: number, hintLevel?: number, questId = "q1"): LogEvent => ({ uid, type, questId, hintLevel, at: min * M });

test("中央値", () => {
  assert.equal(median([]), null);
  assert.equal(median([5, 1, 3]), 3);
  assert.equal(median([4, 1, 3, 2]), 2.5);
});

test("クリアまでの時間・失敗・ヒントを集計する", () => {
  const a = analyze(
    [
      ev("a", "start", 0), ev("a", "fail", 5), ev("a", "hint", 6, 1), ev("a", "clear", 10),
      ev("b", "start", 0), ev("b", "clear", 20),
      ev("c", "start", 0), ev("c", "hint", 2, 1), ev("c", "hint", 4, 2), ev("c", "fail", 5),
    ],
    ["q1", "q2"],
  );
  const q1 = a.quests[0];
  assert.equal(q1.started, 3);
  assert.equal(q1.cleared, 2);
  assert.equal(q1.clearMinutes, 15);
  assert.equal(q1.failsBeforeClear, 0.5);
  assert.equal(q1.hintRate, 0.5);
  assert.deepEqual(q1.hintMinutes, [4, 4, null]);
  assert.deepEqual(a.quests[1], { questId: "q2", started: 0, cleared: 0, clearMinutes: null, failsBeforeClear: null, hintRate: null, hintMinutes: [null, null, null] });
  assert.deepEqual(a.stuck.map((s) => s.uid), ["c"]);
});

test("クリア後の再挑戦のログは数えない", () => {
  const a = analyze([ev("a", "start", 0), ev("a", "clear", 10), ev("a", "start", 100), ev("a", "fail", 101), ev("a", "hint", 102, 3), ev("a", "clear", 110)], ["q1"]);
  assert.equal(a.quests[0].clearMinutes, 10);
  assert.equal(a.quests[0].failsBeforeClear, 0);
  assert.equal(a.quests[0].hintRate, 0);
});

test("声かけ候補：失敗 3 回・ヒント 3・中央値の 2 倍以上", () => {
  const a = analyze(
    [
      ev("done", "start", 0), ev("done", "clear", 10),
      ev("fails", "start", 0), ev("fails", "fail", 1), ev("fails", "fail", 2), ev("fails", "fail", 3),
      ev("hint3", "start", 0), ev("hint3", "hint", 1, 3),
      ev("slow", "start", 0), ev("slow", "hint", 25, 1),
      ev("ok", "start", 0), ev("ok", "hint", 5, 1),
    ],
    ["q1"],
  );
  const alert = Object.fromEntries(a.stuck.map((s) => [s.uid, s.alert]));
  assert.deepEqual(alert, { fails: true, hint3: true, slow: true, ok: false });
  assert.equal(a.stuck.at(-1)!.uid, "ok");
});

test("時間の表示", () => {
  assert.equal(formatMinutes(null), "-");
  assert.equal(formatMinutes(12.4), "12 分");
  assert.equal(formatMinutes(65), "1 時間 5 分");
  assert.equal(formatMinutes(120), "2 時間");
});
