// クエスト定義のテスト（模範解答が合格し、ひな形のままでは不合格になるか）
// 実行: npm run test:quests
import assert from "node:assert/strict";
import { test } from "node:test";
import { BADGES, UNLOCKABLES } from "../src/data/rewards.ts";
import { QUESTS } from "../src/data/quests.ts";
import { verifyQuest } from "../src/lib/validator.ts";

const allObserved = (n: number) => Array.from({ length: n }, () => true);

for (const q of QUESTS) {
  test(`${q.order}. ${q.title}：模範解答は合格する`, () => {
    const r = verifyQuest(q, q.solution.python, allObserved(q.validation.observations.length));
    assert.ok(r.passed, r.codeResults.filter((x) => !x.ok).map((x) => x.message).join(" / "));
  });
  test(`${q.order}. ${q.title}：ひな形のままでは不合格`, () => {
    assert.equal(verifyQuest(q, q.starter.python, allObserved(q.validation.observations.length)).passed, false);
  });
  test(`${q.order}. ${q.title}：ヒントは 3 段階（観察 → 焦点 → 穴あき）`, () => {
    assert.deepEqual(q.hints.map((h) => h.kind), ["observe", "focus", "partial"]);
  });
  test(`${q.order}. ${q.title}：前提・バッジ・報酬の参照先がある`, () => {
    for (const id of q.prerequisites) assert.ok(QUESTS.some((x) => x.id === id), `前提 ${id} がない`);
    if (q.reward.badgeId) assert.ok(BADGES.some((b) => b.id === q.reward.badgeId), `バッジ ${q.reward.badgeId} がない`);
    if (q.reward.unlock) assert.ok(UNLOCKABLES.some((u) => u.id === q.reward.unlock!.id && u.type === q.reward.unlock!.type), `解放 ${q.reward.unlock.id} がない`);
  });
}

test("id と番号が重ならない", () => {
  assert.equal(new Set(QUESTS.map((q) => q.id)).size, QUESTS.length);
  assert.equal(new Set(QUESTS.map((q) => q.order)).size, QUESTS.length);
});
