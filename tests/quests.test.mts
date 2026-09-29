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

// 模範解答とはちがうけれど正しい書き方。これらも合格しなければいけない
const ALTERNATIVES: Record<string, { name: string; code: string }[]> = {
  "q01-fence": [
    {
      name: "range(0, 10) と大文字のチャットコマンド",
      code: `def on_on_chat():
    agent.set_item(COBBLESTONE, 64, 1)
    agent.set_slot(1)
    for index in range(0, 10):
        agent.move(FORWARD, 1)
        agent.place(BACK)

player.on_chat("Fence", on_on_chat)`,
    },
  ],
  "q04-bridge": [
    {
      name: "range(0, num1)",
      code: `def on_on_chat(num1):
    agent.set_item(PLANKS_OAK, 64, 1)
    agent.set_slot(1)
    for index in range(0, num1):
        agent.move(FORWARD, 1)
        agent.place(DOWN)

player.on_chat("bridge", on_on_chat)`,
    },
  ],
  "q07-torch": [
    {
      name: "変数を 3 ずつふやす（先生が実際に書いたコード）",
      code: `I = 0

def on_on_chat():
    global I
    I = 1
    for index in range(10):
        blocks.place(TORCH, pos(1, 0, I))
        I += 3
player.on_chat("Torch", on_on_chat)`,
    },
    {
      name: "3 * index と I = I + 3",
      code: `def on_on_chat():
    z = 0
    for index in range(1, 11):
        blocks.place(TORCH, pos(1, 0, z))
        z = z + 3

player.on_chat("torch", on_on_chat)`,
    },
    {
      name: "3 * i の順番",
      code: `def on_on_chat():
    for i in range(10):
        blocks.place(TORCH, pos(1, 0, 3 * i))

player.on_chat("torch", on_on_chat)`,
    },
  ],
  "q08-pen": [
    {
      name: "外がわを while で",
      code: `def on_on_chat():
    agent.set_item(OAK_FENCE, 64, 1)
    agent.set_slot(1)
    side = 0
    while side < 4:
        for i in range(4):
            agent.move(FORWARD, 1)
            agent.place(BACK)
        agent.turn(RIGHT_TURN)
        side += 1

player.on_chat("pen", on_on_chat)`,
    },
  ],
  "q09-tree": [
    {
      name: "上限 1 けた・下りるのは 1 マスずつ",
      code: `def on_on_chat():
    height = 0
    while agent.detect(AgentDetection.BLOCK, FORWARD) and height < 9:
        agent.destroy(FORWARD)
        agent.move(UP, 1)
        height += 1
    for i in range(height):
        agent.move(DOWN, 1)
    agent.collect_all()

player.on_chat("chop", on_on_chat)`,
    },
  ],
  "q02-pyramid": [
    {
      name: "for と size = 9 - 2 * layer",
      code: `def on_on_chat():
    for layer in range(5):
        size = 9 - 2 * layer
        blocks.fill(SANDSTONE,
            pos(2 + layer, layer, 2 + layer),
            pos(2 + layer + size - 1, layer, 2 + layer + size - 1),
            FillOperation.REPLACE)

player.on_chat("pyramid", on_on_chat)`,
    },
  ],
  "q10-dice": [
    {
      name: "elif dice in [4, 5]",
      code: `def on_on_chat():
    dice = randint(1, 6)
    player.say("サイコロの目は " + str(dice))
    if dice == 6:
        blocks.place(DIAMOND_BLOCK, pos(0, 0, 2))
    elif dice in [4, 5]:
        blocks.place(GOLD_BLOCK, pos(0, 0, 2))
    else:
        blocks.place(STONE, pos(0, 0, 2))

player.on_chat("dice", on_on_chat)`,
    },
  ],
  "q05-farm": [
    {
      name: "x != 4 で土、else で水",
      code: `def on_on_chat():
    for x in range(9):
        for z in range(9):
            if x != 4:
                blocks.place(FARMLAND, pos(x + 2, -1, z + 2))
            else:
                blocks.place(WATER, pos(x + 2, -1, z + 2))

player.on_chat("farm", on_on_chat)`,
    },
  ],
  "q06-castle": [
    {
      name: "引数の名前が a, b",
      code: `def make_tower(a, b):
    blocks.fill(STONE_BRICKS, pos(a, 0, b), pos(a + 2, 7, b + 2), FillOperation.HOLLOW)

def on_on_chat():
    make_tower(2, 2)
    make_tower(14, 2)
    make_tower(2, 14)
    make_tower(14, 14)
    blocks.fill(STONE_BRICKS, pos(5, 0, 3), pos(13, 4, 3), FillOperation.REPLACE)
    blocks.fill(STONE_BRICKS, pos(5, 0, 15), pos(13, 4, 15), FillOperation.REPLACE)

player.on_chat("castle", on_on_chat)`,
    },
  ],
  "q12-town": [
    {
      name: "x を 8 ずつふやす",
      code: `def make_house(x, z):
    blocks.fill(PLANKS_OAK, pos(x, 0, z), pos(x + 4, 3, z + 4), FillOperation.HOLLOW)
    blocks.fill(AIR, pos(x + 2, 0, z), pos(x + 2, 1, z), FillOperation.REPLACE)

def on_on_chat():
    x = 2
    for i in range(0, 5):
        make_house(x, 2)
        x += 8

player.on_chat("town", on_on_chat)`,
    },
  ],
};

for (const [id, alts] of Object.entries(ALTERNATIVES)) {
  const q = QUESTS.find((x) => x.id === id)!;
  for (const alt of alts) {
    test(`${q.order}. ${q.title}：別の正しい書き方（${alt.name}）も合格する`, () => {
      const r = verifyQuest(q, alt.code, allObserved(q.validation.observations.length));
      assert.ok(r.passed, r.codeResults.filter((x) => !x.ok).map((x) => x.message).join(" / "));
    });
  }
}

test("id と番号が重ならない", () => {
  assert.equal(new Set(QUESTS.map((q) => q.id)).size, QUESTS.length);
  assert.equal(new Set(QUESTS.map((q) => q.order)).size, QUESTS.length);
});
