import type { Quest } from "@/types/quest";

// ============================================================
// サンプルクエスト 3本
//  Q1 ブロック並べ（初級） → Q2 ピラミッド自動建築（中級） → Q3 迷路脱出（上級）
// コードは Minecraft Education の MakeCode（Python表示）に準拠
// ============================================================

export const QUESTS: Quest[] = [
  // ----------------------------------------------------------
  {
    id: "q01-fence",
    area: "meadow",
    tier: "beginner",
    order: 1,
    title: "村の柵をならべよ",
    mapPos: { x: 16, y: 72 },
    prerequisites: [],
    concepts: ["event", "sequence", "loop"],
    estimatedMinutes: 20,
    story: [
      { npc: "villager", text: "たいへんだ！ 夜になるとゾンビが畑をあらしに来るんだ…。" },
      { npc: "villager", text: "畑の前に、丸石の柵を 10 ブロックならべてくれないか？" },
      { npc: "agent", text: "ボクに命令してくれれば、1マスずつ置いていけるよ！ でも 10 回も同じことを書くのは大変だね…。" },
    ],
    objective: "エージェントを使って、丸石ブロックを一直線に 10 個ならべよう。",
    goals: [
      "チャットで「fence」と打つとプログラムが動く",
      "丸石が 10 個、まっすぐ 1 列にならぶ",
      "「くりかえし」を使って、置く命令は 1 回だけ書く",
    ],
    starter: {
      worldSetup: [
        "平らな場所（スーパーフラットがおすすめ）に立つ",
        "エージェントを自分の前に呼ぶ（Code Builder で「エージェントをプレイヤーの位置に戻す」）",
      ],
      blocks: [
        {
          category: "player",
          label: "チャットコマンド「fence」を入力したとき",
          children: [
            { category: "agent", label: "エージェントのスロット 1 に 丸石 を 64 個セット" },
            { category: "agent", label: "エージェントのスロット 1 を使う" },
            {
              category: "loops",
              label: "くりかえし 〇 回",
              blank: true,
              children: [
                { category: "agent", label: "エージェントを 前 に 1 ブロック移動" },
                { category: "agent", label: "エージェントに 後ろ にブロックを置かせる" },
              ],
            },
          ],
        },
      ],
      python: `def on_on_chat():
    agent.set_item(COBBLESTONE, 64, 1)
    agent.set_slot(1)
    # ▼ 下の2行を「くりかえし」の中に入れよう
    agent.move(FORWARD, 1)
    agent.place(BACK)

player.on_chat("fence", on_on_chat)`,
    },
    hints: [
      {
        level: 1,
        kind: "observe",
        title: "まず観察しよう",
        body: "今のコードを実行すると、ブロックは何個置かれた？ 10 個と比べて、何が足りないかな？",
      },
      {
        level: 2,
        kind: "focus",
        title: "ここに注目",
        body: "「1 マス進む → 置く」というセットを何回やればいい？ そのセットをまとめて何度もやってくれるブロックが「ループ」のなかまにあるよ。",
      },
      {
        level: 3,
        kind: "partial",
        title: "コードのかたち",
        body: "インデント（字下げ）に注意。くりかえしたい命令は、for の行より右にそろえよう。",
        snippet: `for index in range(__):
    agent.move(FORWARD, 1)
    agent.place(BACK)`,
      },
    ],
    validation: {
      codeRules: [
        { type: "contains", pattern: String.raw`player\.on_chat\(\s*["']fence["']`, message: "チャットコマンド「fence」が見つからないよ" },
        { type: "contains", pattern: String.raw`\b(for|while)\b|loops\.repeat`, message: "「くりかえし」が使われていないみたい" },
        { type: "contains", pattern: String.raw`range\(\s*10\s*\)|<\s*10\b`, message: "くりかえす回数は 10 回になっているかな？" },
        { type: "maxCount", pattern: String.raw`agent\.place\(`, max: 1, message: "置く命令が 2 回以上書かれているよ。くりかえしにまとめよう" },
      ],
      observations: [
        "丸石が 10 個ならんだ",
        "列がまっすぐで、とちゅうで曲がっていない",
      ],
    },
    reward: { exp: 100, noHintBonus: 30, badgeId: "loop-starter", unlock: { type: "title", id: "loop-crafter" } },
    solution: {
      python: `def on_on_chat():
    agent.set_item(COBBLESTONE, 64, 1)
    agent.set_slot(1)
    for index in range(10):
        agent.move(FORWARD, 1)
        agent.place(BACK)

player.on_chat("fence", on_on_chat)`,
      blocksNote: "「くりかえし 10 回」の中に「前に1移動」「後ろに置く」を入れる。発展：高さ2段にするには二重ループ。",
    },
  },

  // ----------------------------------------------------------
  {
    id: "q02-pyramid",
    area: "desert",
    tier: "intermediate",
    order: 2,
    title: "砂漠のピラミッドを自動建築せよ",
    mapPos: { x: 50, y: 40 },
    prerequisites: ["q01-fence"],
    concepts: ["event", "variable", "loop"],
    estimatedMinutes: 35,
    story: [
      { npc: "sage", text: "旅の者よ。この砂漠には、昔『1 段ごとに 2 マスずつ小さくなる』ピラミッドがあったという…。" },
      { npc: "sage", text: "手で積めば日が暮れる。だが『変数』と『くりかえし』を使えば、一瞬で建つはずじゃ。" },
      { npc: "agent", text: "1 段目は 9×9、2 段目は 7×7…って、数字がどんどん変わるね！" },
    ],
    objective: "砂岩で 9×9 → 7×7 → 5×5 → 3×3 → 1×1 の 5 段ピラミッドを、1 回のチャットコマンドで建てよう。",
    goals: [
      "チャットで「pyramid」と打つとピラミッドが建つ",
      "5 段で、上の段ほど 1 マスずつ内側に入っている",
      "変数（大きさ・高さ）を使い、fill 命令は 1 回だけ書く",
    ],
    starter: {
      worldSetup: [
        "広い平地（15×15 以上）に立ち、北を向く",
        "ピラミッドは自分の少し前（x+2, z+2 あたり）から建ちます",
      ],
      blocks: [
        {
          category: "player",
          label: "チャットコマンド「pyramid」を入力したとき",
          children: [
            { category: "variables", label: "変数 size を 9 にする" },
            { category: "variables", label: "変数 layer を 0 にする" },
            {
              category: "loops",
              label: "もし 〇〇 のあいだ くりかえす",
              blank: true,
              children: [
                { category: "blocks", label: "砂岩 で (2+layer, layer, 2+layer) から (〇, layer, 〇) までうめる", blank: true },
                { category: "variables", label: "size を 〇 だけ変える", blank: true },
                { category: "variables", label: "layer を 1 だけ変える" },
              ],
            },
          ],
        },
      ],
      python: `def on_on_chat():
    size = 9
    layer = 0
    while ______:          # いつまでくりかえす？
        blocks.fill(SANDSTONE,
            pos(2 + layer, layer, 2 + layer),
            pos(______, layer, ______),   # 反対側の角は？
            FillOperation.REPLACE)
        size = size ______ # 1段ごとに どう変わる？
        layer += 1

player.on_chat("pyramid", on_on_chat)`,
    },
    hints: [
      {
        level: 1,
        kind: "observe",
        title: "紙に書いてみよう",
        body: "1 段目・2 段目・3 段目の「一辺の長さ」と「高さ」を表にしてみよう。どんなきまりで変わっている？",
      },
      {
        level: 2,
        kind: "focus",
        title: "角の座標がカギ",
        body: "fill は「始まりの角」と「終わりの角」の 2 点で四角をうめるよ。始まりが 2+layer なら、終わりは「始まり + 一辺 − 1」。ピラミッドが傾いたり、はみ出したりしたら、ここを確認しよう。",
      },
      {
        level: 3,
        kind: "partial",
        title: "ループの終わり方",
        body: "size が 0 以下になったら止まれば OK。while の条件と、size の減らし方を見直そう。",
        snippet: `while size > __:
    ...
    size = size - __`,
      },
    ],
    validation: {
      codeRules: [
        { type: "contains", pattern: String.raw`player\.on_chat\(\s*["']pyramid["']`, message: "チャットコマンド「pyramid」が見つからないよ" },
        { type: "contains", pattern: String.raw`blocks\.fill\(`, message: "blocks.fill（うめる）を使ってみよう" },
        { type: "maxCount", pattern: String.raw`blocks\.fill\(`, max: 1, message: "fill が何回も書かれているよ。1 回にしてループでくりかえそう" },
        { type: "contains", pattern: String.raw`\b(while|for)\b`, message: "くりかえしが見つからないよ" },
        { type: "contains", pattern: String.raw`size\s*(-=\s*2|=\s*size\s*-\s*2)`, message: "1 段ごとに size を 2 ずつ小さくしているかな？" },
      ],
      observations: [
        "5 段のピラミッドができた",
        "いちばん上が 1 ブロックになった",
        "どの段も中心がそろっている（かたむいていない）",
      ],
    },
    reward: { exp: 200, noHintBonus: 60, badgeId: "pyramid-architect", unlock: { type: "skin", id: "gold" } },
    solution: {
      python: `def on_on_chat():
    size = 9
    layer = 0
    while size > 0:
        blocks.fill(SANDSTONE,
            pos(2 + layer, layer, 2 + layer),
            pos(2 + layer + size - 1, layer, 2 + layer + size - 1),
            FillOperation.REPLACE)
        size = size - 2
        layer += 1

player.on_chat("pyramid", on_on_chat)`,
      blocksNote: "発展：size の初期値をチャット引数（num1）で受け取れば、好きな大きさのピラミッドが建つ。中を空洞にするには FillOperation.HOLLOW。",
    },
  },

  // ----------------------------------------------------------
  {
    id: "q03-maze",
    area: "cave",
    tier: "advanced",
    order: 3,
    title: "地下迷宮からエージェントを脱出させよ",
    mapPos: { x: 82, y: 66 },
    prerequisites: ["q02-pyramid"],
    concepts: ["event", "condition", "loop", "function", "algorithm"],
    estimatedMinutes: 45,
    story: [
      { npc: "blacksmith", text: "大変だ、エージェントが地下迷宮に迷いこんじまった！ 出口の床には金ブロックが埋まってるはずだ。" },
      { npc: "blacksmith", text: "迷路のかたちは毎回ちがう。道順を覚えさせるんじゃなく、『どんな迷路でも出られるルール』を教えてやってくれ。" },
      { npc: "agent", text: "目の前にカベがあるか調べることはできるよ。あとは、どっちに曲がるか決めるルールがほしいな…。" },
    ],
    objective: "「右手法（右の壁に手をついて進む）」のアルゴリズムを関数にして、金ブロックの上にたどり着くまでエージェントを自動で進ませよう。",
    goals: [
      "チャットで「escape」と打つと自動で迷路を進む",
      "金ブロックの上に着いたら止まって「ゴール！」と表示",
      "1 歩分の動きを自分で作った関数にまとめる",
      "無限ループを防ぐため、歩数の上限を決める",
    ],
    starter: {
      worldSetup: [
        "先生が用意した迷路ワールドを開く（または石ブロック・高さ 2 で自作）",
        "ゴールの床を金ブロックにする",
        "入口に立ち、迷路の中を向いて「エージェントをプレイヤーの位置に戻す」",
      ],
      blocks: [
        {
          category: "functions",
          label: "関数 右手で1歩",
          children: [
            { category: "agent", label: "エージェントを 右 に回転" },
            {
              category: "loops",
              label: "〇〇 のあいだ くりかえす",
              blank: true,
              children: [{ category: "agent", label: "エージェントを 〇 に回転", blank: true }],
            },
            { category: "agent", label: "エージェントを 前 に 1 ブロック移動" },
          ],
        },
        {
          category: "player",
          label: "チャットコマンド「escape」を入力したとき",
          children: [
            { category: "variables", label: "変数 steps を 0 にする" },
            {
              category: "loops",
              label: "（ゴールではない）かつ（steps < 300）のあいだ くりかえす",
              children: [
                { category: "functions", label: "関数 右手で1歩 を呼び出す" },
                { category: "variables", label: "steps を 1 だけ変える" },
              ],
            },
            {
              category: "logic",
              label: "もし ゴールなら",
              children: [{ category: "player", label: "「ゴール！」と言う" }],
              elseChildren: [{ category: "player", label: "「見つからなかった…」と言う" }],
            },
          ],
        },
      ],
      python: `def is_goal():
    # 足もとのブロックが 金ブロック なら True
    return agent.inspect(AgentInspection.BLOCK, DOWN) == GOLD_BLOCK

def step_right_hand():
    agent.turn(RIGHT_TURN)
    # 前にカベがあるあいだ、どっちに回る？
    while ______:
        agent.turn(______)
    agent.move(FORWARD, 1)

def on_on_chat():
    steps = 0
    while not is_goal() and steps < 300:
        step_right_hand()
        steps += 1
    # ゴールできたかどうかで、言うことを変えよう

player.on_chat("escape", on_on_chat)`,
    },
    hints: [
      {
        level: 1,
        kind: "observe",
        title: "自分がエージェントになってみよう",
        body: "紙に迷路をかいて、右手を壁につけたまま指でなぞってみよう。行き止まりではどう動いた？ エージェントが同じ場所をぐるぐるしていないか、実行して観察しよう。",
      },
      {
        level: 2,
        kind: "focus",
        title: "回る向きのルール",
        body: "右手法の順番は「右 → まっすぐ → 左 → 後ろ」。まず右を向いて、カベなら左へ 1 回ずつ戻していけば、この順番どおりに調べられるよ。while の条件で使う『カベがあるか』は agent.detect で調べられる。",
      },
      {
        level: 3,
        kind: "partial",
        title: "判定のかたち",
        body: "detect は True / False を返すよ。while のうしろにそのまま書ける。",
        snippet: `while agent.detect(AgentDetection.BLOCK, ______):
    agent.turn(______)`,
      },
    ],
    validation: {
      codeRules: [
        { type: "contains", pattern: String.raw`player\.on_chat\(\s*["']escape["']`, message: "チャットコマンド「escape」が見つからないよ" },
        { type: "contains", pattern: String.raw`agent\.detect\(`, message: "カベを調べる agent.detect が使われていないよ" },
        { type: "contains", pattern: String.raw`\bwhile\b`, message: "「〜のあいだくりかえす（while）」を使おう" },
        { type: "minCount", pattern: String.raw`^\s*def\s+\w+`, flags: "m", min: 2, message: "チャットコマンド以外に、自分の関数を 1 つ以上作ろう" },
        { type: "contains", pattern: String.raw`GOLD_BLOCK`, message: "ゴール（金ブロック）の判定が見つからないよ" },
        { type: "contains", pattern: String.raw`<=?\s*\d{2,}`, message: "無限ループ防止の「歩数の上限」を入れよう（例：steps < 300）" },
        { type: "contains", pattern: String.raw`\bif\b`, message: "ゴールできたかどうかで、もし〜なら（if）を使ってメッセージを変えよう" },
      ],
      observations: [
        "エージェントが金ブロックの上で止まった",
        "チャットに「ゴール！」と表示された",
        "迷路の形を少し変えても、ちゃんと脱出できた",
      ],
    },
    reward: { exp: 350, noHintBonus: 100, badgeId: "maze-runner", unlock: { type: "title", id: "labyrinth-sage" } },
    solution: {
      python: `def is_goal():
    return agent.inspect(AgentInspection.BLOCK, DOWN) == GOLD_BLOCK

def step_right_hand():
    agent.turn(RIGHT_TURN)
    while agent.detect(AgentDetection.BLOCK, FORWARD):
        agent.turn(LEFT_TURN)
    agent.move(FORWARD, 1)

def on_on_chat():
    steps = 0
    while not is_goal() and steps < 300:
        step_right_hand()
        steps += 1
    if is_goal():
        player.say("ゴール！ " + str(steps) + " 歩でした")
    else:
        player.say("見つからなかった…")

player.on_chat("escape", on_on_chat)`,
      blocksNote: "発展：左手法と歩数を比べる／通った床に色ブロックを置いて軌跡を可視化する／島（壁が浮いている迷路）では右手法が失敗することを体験させ、探索アルゴリズムの話へつなげる。",
    },
  },
];

/** マップに「？」で表示する今後のクエスト（期待感の演出） */
export const TEASERS = [
  { id: "t-bridge", title: "谷にかける橋", area: "meadow", mapPos: { x: 32, y: 50 } },
  { id: "t-farm", title: "自動収穫ファーム", area: "village", mapPos: { x: 64, y: 22 } },
  { id: "t-castle", title: "関数で城を建てよ", area: "cave", mapPos: { x: 90, y: 30 } },
] as const;

export const getQuest = (id: string) => QUESTS.find((q) => q.id === id);
