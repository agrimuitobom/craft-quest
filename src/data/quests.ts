import type { Quest } from "@/types/quest";

// ============================================================
// クエスト 12 本（order がマップ・一覧の番号。前提は 1 つ前のクエスト）
//  初級：1 柵（ループ） → 2 橋（変数/チャット引数） → 3 たいまつ（ループ変数 i） → 4 羊のかこい（二重ループ）
//  中級：5 木こり（while とセンサー） → 6 ピラミッド（変数と while） → 7 サイコロ（乱数と if/elif） → 8 畑（二重ループと if）
//  上級：9 迷宮（条件/関数/アルゴリズム） → 10 城（引数つき関数） → 11 虹の道（リスト） → 12 町（関数とくりかえし）
// id は保存データのキーなので、順番を変えても書きかえないこと
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
    mapPos: { x: 16, y: 88 },
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
    id: "q04-bridge",
    area: "meadow",
    tier: "beginner",
    order: 2,
    title: "谷にかける橋",
    mapPos: { x: 32, y: 78 },
    prerequisites: ["q01-fence"],
    concepts: ["event", "variable", "loop"],
    estimatedMinutes: 20,
    story: [
      { npc: "villager", text: "柵のおかげで畑は守れたよ！ でも、谷の向こうの森へ木を取りに行けないんだ。" },
      { npc: "villager", text: "谷のはばは、場所によって 5 マスだったり 12 マスだったり…。そのたびにプログラムを書き直すのは大変だよね。" },
      { npc: "agent", text: "チャットで「bridge 5」みたいに数字もいっしょに言ってくれたら、その長さで橋をかけられるよ！" },
    ],
    objective: "チャットで「bridge 数字」と打つと、その数と同じ長さの板の橋をエージェントがかけるようにしよう。",
    goals: [
      "「bridge 5」で 5 マス、「bridge 12」で 12 マスの橋ができる",
      "コードを書き直さなくても、数字を変えるだけで長さが変わる",
      "置く命令は 1 回だけ書く",
    ],
    starter: {
      worldSetup: [
        "はば 2 ブロック以上の谷（みぞ）を用意する（なければ地面をほって作る）",
        "谷のはしに立ち、谷の向こうを向く",
        "エージェントを自分の位置に呼ぶ（Code Builder で「エージェントをプレイヤーの位置に戻す」）",
      ],
      blocks: [
        {
          category: "player",
          label: "チャットコマンド「bridge」(num1) を入力したとき",
          children: [
            { category: "agent", label: "エージェントのスロット 1 に オークの板 を 64 個セット" },
            { category: "agent", label: "エージェントのスロット 1 を使う" },
            {
              category: "loops",
              label: "くりかえし 10 回　← いつも 10 マスになってしまう…",
              blank: true,
              children: [
                { category: "agent", label: "エージェントを 前 に 1 ブロック移動" },
                { category: "agent", label: "エージェントに 下 にブロックを置かせる" },
              ],
            },
          ],
        },
      ],
      python: `def on_on_chat(num1):
    agent.set_item(PLANKS_OAK, 64, 1)
    agent.set_slot(1)
    # ▼ いつも 10 マスの橋になってしまう…
    for index in range(10):
        agent.move(FORWARD, 1)
        agent.place(DOWN)

player.on_chat("bridge", on_on_chat)`,
    },
    hints: [
      {
        level: 1,
        kind: "observe",
        title: "ためしてみよう",
        body: "「bridge 5」と「bridge 12」を両方ためしてみよう。橋の長さはそれぞれ何マスになった？ チャットで打った数字は、どこかで使われているかな？",
      },
      {
        level: 2,
        kind: "focus",
        title: "数字の入れもの",
        body: "チャットで打った数字は、関数の（ ）の中にある num1 という変数に入っているよ。くりかえす回数を決めているところを見てみよう。",
      },
      {
        level: 3,
        kind: "partial",
        title: "コードのかたち",
        body: "range の（ ）には、数字のかわりに変数を書くこともできるよ。",
        snippet: `for index in range(____):
    agent.move(FORWARD, 1)
    agent.place(DOWN)`,
      },
    ],
    validation: {
      codeRules: [
        { type: "contains", pattern: String.raw`player\.on_chat\(\s*["']bridge["']`, message: "チャットコマンド「bridge」が見つからないよ" },
        { type: "contains", pattern: String.raw`def\s+\w+\(\s*num1`, message: "チャットの数字を受け取る num1 が関数の（ ）に入っていないよ" },
        { type: "contains", pattern: String.raw`\b(for|while)\b`, message: "「くりかえし」が使われていないみたい" },
        { type: "notContains", pattern: String.raw`range\(\s*\d+\s*\)`, message: "くりかえす回数が数字で決まっているよ。チャットで打った数字を使おう" },
        { type: "contains", pattern: String.raw`range\(\s*num1\s*\)|<\s*num1\b`, message: "くりかえす回数に num1 が使われていないよ" },
        { type: "maxCount", pattern: String.raw`agent\.place\(`, max: 1, message: "置く命令が 2 回以上書かれているよ。くりかえしにまとめよう" },
      ],
      observations: [
        "「bridge 5」で 5 マスの橋ができた",
        "コードを書き直さずに「bridge 12」で 12 マスの橋ができた",
        "橋の上を歩いて、谷の向こうへわたれた",
      ],
    },
    reward: { exp: 150, noHintBonus: 40, badgeId: "bridge-builder", unlock: { type: "title", id: "bridge-master" } },
    solution: {
      python: `def on_on_chat(num1):
    agent.set_item(PLANKS_OAK, 64, 1)
    agent.set_slot(1)
    for index in range(num1):
        agent.move(FORWARD, 1)
        agent.place(DOWN)

player.on_chat("bridge", on_on_chat)`,
      blocksNote: "「くりかえし」の回数のところに、チャットコマンドのブロックから num1 をドラッグして入れる。発展：スロット 2 に柵を入れて左右に手すりを付ける／はば 3 マスの橋にする。",
    },
  },

  // ----------------------------------------------------------
  {
    id: "q07-torch",
    area: "meadow",
    tier: "beginner",
    order: 3,
    title: "夜道にたいまつをならべよ",
    mapPos: { x: 18, y: 66 },
    prerequisites: ["q04-bridge"],
    concepts: ["event", "loop", "variable"],
    estimatedMinutes: 20,
    story: [
      { npc: "villager", text: "橋のおかげで森へ行けるようになった！ でも帰り道がまっくらで、ゾンビが出てこわいんだ。" },
      { npc: "villager", text: "道のわきに、3 マスおきにたいまつを 10 本ならべてくれないか？" },
      { npc: "agent", text: "10 回くりかえすのはできるよ。でも、毎回ちがう場所に置かないと…。くりかえしの回数をかぞえている i を使えないかな？" },
    ],
    objective: "チャットで「torch」と打つと、たいまつが 3 マスおきに 10 本ならぶようにしよう。",
    goals: [
      "チャットで「torch」と打つと、たいまつがならぶ",
      "たいまつが 10 本、3 マスおきにならぶ",
      "置く命令は 1 回だけ。置く場所をくりかえしの i で決める",
    ],
    starter: {
      worldSetup: [
        "平らな道の上に立ち、道の先を向く",
        "たいまつは自分の右どなりの列（x+1）に、前へむかってならびます",
        "夜にして（/time set night）明るさを確かめよう",
      ],
      blocks: [
        {
          category: "player",
          label: "チャットコマンド「torch」を入力したとき",
          children: [
            {
              category: "loops",
              label: "i を 0 から 9 まで くりかえす",
              children: [{ category: "blocks", label: "たいまつ を (1, 0, 〇) に置く　← いつも同じ場所…", blank: true }],
            },
          ],
        },
      ],
      python: `def on_on_chat():
    for i in range(10):
        # ▼ 10 回置いているのに、同じ場所にしか置かれない…
        blocks.place(TORCH, pos(1, 0, 3))

player.on_chat("torch", on_on_chat)`,
    },
    hints: [
      {
        level: 1,
        kind: "observe",
        title: "何本見えた？",
        body: "今のコードを実行すると、たいまつは何本見えた？ 10 回置いているのに、なぜその数になったのかな？",
      },
      {
        level: 2,
        kind: "focus",
        title: "i の値を見てみよう",
        body: "くりかえしの i は、1 回目が 0、2 回目が 1、3 回目が 2…と変わっていくよ。置く場所の z を、i を使って決めれば、毎回ちがう場所になるね。",
      },
      {
        level: 3,
        kind: "partial",
        title: "コードのかたち",
        body: "3 マスおきなら、i が 1 ふえるたびに z は 3 ふえるね。",
        snippet: `for i in range(10):
    blocks.place(TORCH, pos(1, 0, i * __))`,
      },
    ],
    validation: {
      codeRules: [
        { type: "contains", pattern: String.raw`player\.on_chat\(\s*["']torch["']`, message: "チャットコマンド「torch」が見つからないよ" },
        { type: "contains", pattern: String.raw`range\(\s*10\s*\)`, message: "10 本になるように、くりかえす回数を確かめよう" },
        { type: "contains", pattern: String.raw`pos\([^\n]*\b(i|index)\b[^\n]*\*\s*3|pos\([^\n]*\b3\s*\*\s*\(?\s*(i|index)\b`, message: "置く場所が、i といっしょに 3 マスずつずれていないよ" },
        { type: "maxCount", pattern: String.raw`blocks\.place\(`, max: 1, message: "置く命令が 2 回以上書かれているよ。くりかえしにまとめよう" },
      ],
      observations: [
        "たいまつが 10 本ならんだ",
        "たいまつとたいまつの間が、どこも同じ（3 マス）になっている",
        "夜にしても、道が明るく見えた",
      ],
    },
    reward: { exp: 120, noHintBonus: 30, badgeId: "torch-bearer" },
    solution: {
      python: `def on_on_chat():
    for i in range(10):
        blocks.place(TORCH, pos(1, 0, i * 3))

player.on_chat("torch", on_on_chat)`,
      blocksNote: "「置く」の z のところに、かけ算ブロック（i × 3）を入れる。発展：チャットの数字 num1 で間隔を変える（i * num1）／道の左右両方にならべる。",
    },
  },

  // ----------------------------------------------------------
  {
    id: "q08-pen",
    area: "meadow",
    tier: "beginner",
    order: 4,
    title: "羊のかこいをつくれ",
    mapPos: { x: 33, y: 52 },
    prerequisites: ["q07-torch"],
    concepts: ["event", "loop", "nested-loop"],
    estimatedMinutes: 25,
    story: [
      { npc: "villager", text: "明るくなって、羊かいのおばあさんも安心したって。でも、羊がすぐにげ出しちゃうんだ。" },
      { npc: "villager", text: "5×5 の四角いかこいを、オークの柵で作ってほしい。すきまがあると、そこからにげちゃうよ。" },
      { npc: "agent", text: "1 辺ならべて右に曲がる。それを 4 回やれば四角になるね。「くりかえし」の中に「くりかえし」…？" },
    ],
    objective: "チャットで「pen」と打つと、エージェントがオークの柵で 5×5 の四角いかこいを作るようにしよう。",
    goals: [
      "チャットで「pen」と打つと、かこいができる",
      "柵が四角くつながって、すきまがない",
      "「1 辺ならべて曲がる」を、くりかえしで 4 回やる（置く命令・曲がる命令は 1 回ずつ）",
    ],
    starter: {
      worldSetup: [
        "平らな草地に立つ",
        "エージェントを自分の位置に呼ぶ（Code Builder で「エージェントをプレイヤーの位置に戻す」）",
      ],
      blocks: [
        {
          category: "player",
          label: "チャットコマンド「pen」を入力したとき",
          children: [
            { category: "agent", label: "エージェントのスロット 1 に オークの柵 を 64 個セット" },
            { category: "agent", label: "エージェントのスロット 1 を使う" },
            {
              category: "loops",
              label: "くりかえし 4 回",
              children: [
                { category: "agent", label: "エージェントを 前 に 1 ブロック移動" },
                { category: "agent", label: "エージェントに 後ろ にブロックを置かせる" },
              ],
            },
            { category: "agent", label: "エージェントを 右 に回転" },
            { category: "loops", label: "〇〇 ← いまは 1 辺だけ。4 辺ぶんにするには？", blank: true },
          ],
        },
      ],
      python: `def on_on_chat():
    agent.set_item(OAK_FENCE, 64, 1)
    agent.set_slot(1)
    for i in range(4):
        agent.move(FORWARD, 1)
        agent.place(BACK)
    agent.turn(RIGHT_TURN)
    # ▼ いまは 1 辺だけ。4 辺ぶんにしたい

player.on_chat("pen", on_on_chat)`,
    },
    hints: [
      {
        level: 1,
        kind: "observe",
        title: "何辺できた？",
        body: "今のコードを実行すると、柵は何辺できた？ 最後にエージェントはどっちを向いている？ 紙にかいて、エージェントの動きをなぞってみよう。",
      },
      {
        level: 2,
        kind: "focus",
        title: "かたまりでくりかえす",
        body: "「4 マスならべる → 右に曲がる」を 1 つのかたまりと考えよう。そのかたまりを、もう 1 つのくりかえしで包むと、何回でもできるよ。",
      },
      {
        level: 3,
        kind: "partial",
        title: "コードのかたち",
        body: "外がわのくりかえしの中に、1 辺ぶんのくりかえしと、曲がる命令が入るよ。インデントに注意。",
        snippet: `for side in range(__):
    for i in range(4):
        agent.move(FORWARD, 1)
        agent.place(BACK)
    agent.turn(____)`,
      },
    ],
    validation: {
      codeRules: [
        { type: "contains", pattern: String.raw`player\.on_chat\(\s*["']pen["']`, message: "チャットコマンド「pen」が見つからないよ" },
        { type: "minCount", pattern: String.raw`\bfor\b`, min: 2, message: "1 辺ぶんのくりかえしを、もう 1 つのくりかえしで包もう" },
        { type: "minCount", pattern: String.raw`range\(\s*4\s*\)`, min: 2, message: "4 辺ぶんくりかえしているかな？" },
        { type: "contains", pattern: String.raw`agent\.turn\(`, message: "エージェントを曲げる命令が見つからないよ" },
        { type: "maxCount", pattern: String.raw`agent\.place\(`, max: 1, message: "置く命令が 2 回以上書かれているよ。くりかえしにまとめよう" },
        { type: "maxCount", pattern: String.raw`agent\.turn\(`, max: 1, message: "曲がる命令が 2 回以上書かれているよ。くりかえしにまとめよう" },
      ],
      observations: [
        "柵が四角くつながった",
        "かどにもすきまがない",
        "中に羊を入れても、にげなかった",
      ],
    },
    reward: { exp: 150, noHintBonus: 40, badgeId: "shepherd" },
    solution: {
      python: `def on_on_chat():
    agent.set_item(OAK_FENCE, 64, 1)
    agent.set_slot(1)
    for side in range(4):
        for i in range(4):
            agent.move(FORWARD, 1)
            agent.place(BACK)
        agent.turn(RIGHT_TURN)

player.on_chat("pen", on_on_chat)`,
      blocksNote: "外がわに「くりかえし 4 回」を置き、その中に「1 辺ぶんのくりかえし」と「右に回転」を入れる。発展：チャットの数字で大きさを変える／入口のゲートを 1 か所だけ付ける。",
    },
  },

  // ----------------------------------------------------------
  {
    id: "q09-tree",
    area: "forest",
    tier: "intermediate",
    order: 5,
    title: "木こりエージェント",
    mapPos: { x: 18, y: 30 },
    prerequisites: ["q08-pen"],
    concepts: ["event", "loop", "condition", "variable"],
    estimatedMinutes: 30,
    story: [
      { npc: "villager", text: "まよいの森へようこそ。村の家をなおすのに、木材がたくさんいるんだ。" },
      { npc: "villager", text: "でも、森の木は高さがバラバラ。3 マスの木もあれば、8 マスの木もある。" },
      { npc: "agent", text: "前にブロックがあるあいだ、切ってはのぼる…をくりかえせば、どんな高さの木でも切れるね！ のぼった回数もかぞえておかなきゃ。" },
    ],
    objective: "チャットで「chop」と打つと、エージェントが目の前の木を根元からてっぺんまで切って、地面にもどってくるようにしよう。",
    goals: [
      "チャットで「chop」と打つと、木を切りはじめる",
      "高さのちがう木でも、同じコードで全部切れる",
      "のぼった回数を変数でかぞえて、その分だけ下りてくる",
      "もしものために、のぼる回数に上限をつける",
    ],
    starter: {
      worldSetup: [
        "オークの原木を 3〜8 個、たてに積んで「木」を作る（葉っぱはなし）",
        "エージェントを木の根元の前に置き、木のほうを向かせる",
      ],
      blocks: [
        {
          category: "player",
          label: "チャットコマンド「chop」を入力したとき",
          children: [
            { category: "variables", label: "変数 height を 0 にする" },
            { category: "loops", label: "〇〇 のあいだ くりかえす ← 前にブロックがあるあいだ", blank: true },
            { category: "agent", label: "エージェントに 前 のブロックをこわさせる" },
            { category: "agent", label: "エージェントを 上 に 1 ブロック移動" },
            { category: "variables", label: "height を 1 だけ変える" },
            { category: "agent", label: "〇〇 ← のぼった分だけ下りる", blank: true },
            { category: "agent", label: "エージェントにアイテムをすべて集めさせる" },
          ],
        },
      ],
      python: `def on_on_chat():
    height = 0
    # ▼ いまは 1 マスしか切れない。前に木があるあいだ くりかえしたい
    agent.destroy(FORWARD)
    agent.move(UP, 1)
    height += 1
    # ▼ 切りおわったら、のぼった分だけ下りてこよう
    agent.collect_all()

player.on_chat("chop", on_on_chat)`,
    },
    hints: [
      {
        level: 1,
        kind: "observe",
        title: "何マス切れた？",
        body: "今のコードを実行すると、木は何マス切れた？ エージェントは最後にどこにいる？ 高さ 3 の木と高さ 6 の木で、何回くりかえせばいいかちがうね。",
      },
      {
        level: 2,
        kind: "focus",
        title: "回数がわからないときのくりかえし",
        body: "何回くりかえすかわからないときは「〜のあいだ（while）」を使うよ。前にブロックがあるかは agent.detect で調べられる。のぼった回数は height に入っているね。",
      },
      {
        level: 3,
        kind: "partial",
        title: "コードのかたち",
        body: "上限をつけておくと、思わぬ高い木でも止まるよ。",
        snippet: `while agent.detect(AgentDetection.BLOCK, ____) and height < 20:
    agent.destroy(FORWARD)
    agent.move(UP, 1)
    height += 1
agent.move(DOWN, ______)`,
      },
    ],
    validation: {
      codeRules: [
        { type: "contains", pattern: String.raw`player\.on_chat\(\s*["']chop["']`, message: "チャットコマンド「chop」が見つからないよ" },
        { type: "contains", pattern: String.raw`\bwhile\b`, message: "「〜のあいだくりかえす（while）」が見つからないよ" },
        { type: "contains", pattern: String.raw`agent\.(detect|inspect)\(`, message: "前にブロックがあるかを調べる命令（agent.detect）が見つからないよ" },
        { type: "contains", pattern: String.raw`<=?\s*\d{2,}`, message: "のぼる回数の上限（例：height < 20）を入れよう" },
        { type: "contains", pattern: String.raw`agent\.move\(\s*DOWN\s*,\s*[a-z_]\w*\s*\)`, message: "のぼった回数の変数を使って、下りてきているかな？" },
        { type: "maxCount", pattern: String.raw`agent\.destroy\(`, max: 1, message: "こわす命令が 2 回以上書かれているよ。くりかえしにまとめよう" },
      ],
      observations: [
        "木が根元からてっぺんまで、ぜんぶなくなった",
        "エージェントが地面までもどってきた",
        "高さのちがう木でも、コードを変えずに切れた",
      ],
    },
    reward: { exp: 220, noHintBonus: 60, badgeId: "lumberjack", unlock: { type: "title", id: "forest-ranger" } },
    solution: {
      python: `def on_on_chat():
    height = 0
    while agent.detect(AgentDetection.BLOCK, FORWARD) and height < 20:
        agent.destroy(FORWARD)
        agent.move(UP, 1)
        height += 1
    agent.move(DOWN, height)
    agent.collect_all()

player.on_chat("chop", on_on_chat)`,
      blocksNote: "「〜のあいだくりかえす」の条件に「エージェントが前にブロックを検出」と「height < 20」を「かつ」でつなぐ。発展：切ったあとに苗木を植える／横にならんだ木を順番に切る。",
    },
  },

  // ----------------------------------------------------------
  {
    id: "q02-pyramid",
    area: "desert",
    tier: "intermediate",
    order: 6,
    title: "砂漠のピラミッドを自動建築せよ",
    mapPos: { x: 42, y: 22 },
    prerequisites: ["q09-tree"],
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
    id: "q10-dice",
    area: "desert",
    tier: "intermediate",
    order: 7,
    title: "運だめしの祭壇",
    mapPos: { x: 62, y: 38 },
    prerequisites: ["q02-pyramid"],
    concepts: ["event", "variable", "random", "condition"],
    estimatedMinutes: 30,
    story: [
      { npc: "sage", text: "ピラミッドの奥に、ふしぎな祭壇が見つかった。サイコロをふると、目によってちがう宝が出てくるらしい。" },
      { npc: "sage", text: "6 ならダイヤモンド、4 か 5 なら金、それ以外なら石。…だが、いまはいつも石しか出てこないのじゃ。" },
      { npc: "agent", text: "サイコロの目によって、出すブロックを変えればいいんだね。「もし〜なら」を 3 つに分けられるかな？" },
    ],
    objective: "チャットで「dice」と打つとサイコロ（1〜6 の乱数）をふり、目によって ダイヤモンドブロック・金ブロック・石 のどれかが出るようにしよう。",
    goals: [
      "チャットで「dice」と打つと、サイコロの目がチャットに出る",
      "6 ならダイヤモンドブロック、4 か 5 なら金ブロック、それ以外は石が出る",
      "「もし（if）」「そうでなくてもし（elif）」「そうでなければ（else）」で 3 つに分ける",
    ],
    starter: {
      worldSetup: [
        "平らな場所に立つ",
        "ブロックは自分の 2 マス前（z+2）に出ます。何回かためすときは、出たブロックをこわしてからやろう",
      ],
      blocks: [
        {
          category: "player",
          label: "チャットコマンド「dice」を入力したとき",
          children: [
            { category: "variables", label: "変数 dice を 1 から 6 までの乱数 にする" },
            { category: "player", label: "「サイコロの目は」+ dice と言う" },
            { category: "blocks", label: "石 を (0, 0, 2) に置く　← いつも石…" },
            { category: "logic", label: "〇〇 ← 目によってブロックを変えるには？", blank: true },
          ],
        },
      ],
      python: `def on_on_chat():
    dice = randint(1, 6)
    player.say("サイコロの目は " + str(dice))
    # ▼ いつも石しか出てこない。目によって出すブロックを変えたい
    #   6 → ダイヤモンドブロック、4 か 5 → 金ブロック、それ以外 → 石
    blocks.place(STONE, pos(0, 0, 2))

player.on_chat("dice", on_on_chat)`,
    },
    hints: [
      {
        level: 1,
        kind: "observe",
        title: "表にしてみよう",
        body: "何回かサイコロをふって、「出た目」と「出てほしいブロック」を表にしてみよう。目はいくつのグループに分かれるかな？",
      },
      {
        level: 2,
        kind: "focus",
        title: "上から順に調べられる",
        body: "if → elif → else は、上から順に調べて、最初に当てはまったところだけが動くよ。6 を先に調べれば、そのあとは「4 以上」だけで 4 と 5 をまとめられるね。",
      },
      {
        level: 3,
        kind: "partial",
        title: "コードのかたち",
        body: "if・elif・else の行の最後には「:」、中の命令は 1 段右にずらすよ。",
        snippet: `if dice == __:
    blocks.place(DIAMOND_BLOCK, pos(0, 0, 2))
elif dice >= __:
    blocks.place(______, pos(0, 0, 2))
else:
    blocks.place(STONE, pos(0, 0, 2))`,
      },
    ],
    validation: {
      codeRules: [
        { type: "contains", pattern: String.raw`player\.on_chat\(\s*["']dice["']`, message: "チャットコマンド「dice」が見つからないよ" },
        { type: "contains", pattern: String.raw`randint\(`, message: "サイコロの乱数（randint）が見つからないよ" },
        { type: "contains", pattern: String.raw`\bif\b`, message: "「もし〜なら（if）」が見つからないよ" },
        { type: "contains", pattern: String.raw`\belif\b`, message: "「そうでなくてもし（elif）」で、3 つに分けよう" },
        { type: "contains", pattern: String.raw`\belse\b`, message: "「そうでなければ（else）」が見つからないよ" },
        { type: "contains", pattern: String.raw`\bDIAMOND_BLOCK\b`, message: "ダイヤモンドブロック（DIAMOND_BLOCK）が見つからないよ" },
        { type: "contains", pattern: String.raw`\bGOLD_BLOCK\b`, message: "金ブロック（GOLD_BLOCK）が見つからないよ" },
        { type: "contains", pattern: String.raw`==\s*6\b|>=\s*6\b|>\s*5\b`, message: "6 が出たときの条件が見つからないよ" },
        { type: "contains", pattern: String.raw`>=\s*4\b|>\s*3\b|==\s*[45]\b`, message: "4 か 5 が出たときの条件が見つからないよ" },
      ],
      observations: [
        "サイコロの目がチャットに出た",
        "何回かためして、ダイヤモンド・金・石がぜんぶ出た",
        "出た目と出たブロックが、きまりどおりだった",
      ],
    },
    reward: { exp: 220, noHintBonus: 60, badgeId: "lucky-roller", unlock: { type: "skin", id: "lapis" } },
    solution: {
      python: `def on_on_chat():
    dice = randint(1, 6)
    player.say("サイコロの目は " + str(dice))
    if dice == 6:
        blocks.place(DIAMOND_BLOCK, pos(0, 0, 2))
    elif dice >= 4:
        blocks.place(GOLD_BLOCK, pos(0, 0, 2))
    else:
        blocks.place(STONE, pos(0, 0, 2))

player.on_chat("dice", on_on_chat)`,
      blocksNote: "「論理」の「もし〜なら〜でなければ」の＋ボタンで「でなければもし」を足して 3 つに分ける。発展：条件の順番を入れかえると結果がどう変わるか試す／出た回数をかぞえて、本当に 6 分の 1 くらいか調べる。",
    },
  },

  // ----------------------------------------------------------
  {
    id: "q05-farm",
    area: "village",
    tier: "intermediate",
    order: 8,
    title: "水路つきの畑をつくれ",
    mapPos: { x: 80, y: 16 },
    prerequisites: ["q10-dice"],
    concepts: ["event", "nested-loop", "condition"],
    estimatedMinutes: 35,
    story: [
      { npc: "villager", text: "ようこそクラフト村へ！ 村のみんなのために、小麦の畑を広げたいんだ。" },
      { npc: "villager", text: "でも畑は、近くに水がないとかわいてしまう。9×9 の畑のまん中に、1 本の水路を通してほしいんだ。" },
      { npc: "agent", text: "1 列ならさっき作れたね。81 マスを 1 つずつ書くのは…ムリ！ くりかえしを 2 つ組み合わせられないかな？" },
    ],
    objective: "チャットで「farm」と打つと、9 列 × 9 マスの畑ができて、まん中の列だけが水路になるようにしよう。",
    goals: [
      "チャットで「farm」と打つと畑ができる",
      "9 列 × 9 マスの畑ができる",
      "まん中の 1 列（x が 4 の列）だけが水になる",
      "くりかえしを 2 つ重ねて（二重ループ）、もし〜なら（if）で水と土を使い分ける",
    ],
    starter: {
      worldSetup: [
        "草ブロックの平らな場所に立つ（スーパーフラットがおすすめ）",
        "畑は自分の少し前（x+2, z+2 あたり）から、足もとの高さにできます",
        "できたら小麦の種を手でまいて、育つか確かめよう",
      ],
      blocks: [
        {
          category: "player",
          label: "チャットコマンド「farm」を入力したとき",
          children: [
            { category: "variables", label: "変数 x を 0 にする" },
            {
              category: "loops",
              label: "z を 0 から 8 まで くりかえす",
              children: [{ category: "blocks", label: "耕地 を (x+2, -1, z+2) に置く" }],
            },
            { category: "loops", label: "〇〇 ← 9 列ぶんにするには？ まん中の列を水にするには？", blank: true },
          ],
        },
      ],
      python: `def on_on_chat():
    x = 0
    for z in range(9):
        blocks.place(FARMLAND, pos(x + 2, -1, z + 2))
    # ▼ いまは 1 列だけ。9 列ぶんにしたい
    # ▼ まん中の列（x が 4）だけは WATER にしたい

player.on_chat("farm", on_on_chat)`,
    },
    hints: [
      {
        level: 1,
        kind: "observe",
        title: "何列できた？",
        body: "今のコードを実行すると、畑は何列できた？ 次の列を作るには、x と z のどちらを変えればいいかな？ 方眼紙に x と z を書きこんでみよう。",
      },
      {
        level: 2,
        kind: "focus",
        title: "くりかえしの中にくりかえし",
        body: "「1 列作る」くりかえしを、さらに「x を 0, 1, 2… と変える」くりかえしで包むと、面ができるよ。水にするかどうかは、いまが何列目か（x の値）で決まるね。",
      },
      {
        level: 3,
        kind: "partial",
        title: "コードのかたち",
        body: "インデント（字下げ）が 3 段になるよ。if と else の位置をそろえよう。",
        snippet: `for x in range(__):
    for z in range(9):
        if x == __:
            blocks.place(WATER, pos(x + 2, -1, z + 2))
        else:
            blocks.place(FARMLAND, pos(x + 2, -1, z + 2))`,
      },
    ],
    validation: {
      codeRules: [
        { type: "contains", pattern: String.raw`player\.on_chat\(\s*["']farm["']`, message: "チャットコマンド「farm」が見つからないよ" },
        { type: "minCount", pattern: String.raw`\bfor\b`, min: 2, message: "くりかえしの中に、もう 1 つくりかえしを入れよう（二重ループ）" },
        { type: "contains", pattern: String.raw`\bif\b`, message: "水と土を使い分ける「もし〜なら（if）」が見つからないよ" },
        { type: "contains", pattern: String.raw`\bWATER\b`, message: "水路にする WATER が見つからないよ" },
        { type: "contains", pattern: String.raw`\bFARMLAND\b`, message: "畑にする FARMLAND が見つからないよ" },
        { type: "contains", pattern: String.raw`[=!]=\s*4\b|\b4\s*[=!]=`, message: "水にするのは何列目？ 0 から数えて、まん中の列の番号を確かめよう" },
        { type: "maxCount", pattern: String.raw`blocks\.place\(`, max: 2, message: "place が 3 回以上書かれているよ。くりかえしにまとめよう" },
      ],
      observations: [
        "9 列 × 9 マスの畑ができた",
        "まん中の 1 列だけが水になった",
        "種をまいたら、土の色がこくなって小麦が育ちはじめた",
      ],
    },
    reward: { exp: 250, noHintBonus: 70, badgeId: "farm-engineer", unlock: { type: "skin", id: "emerald" } },
    solution: {
      python: `def on_on_chat():
    for x in range(9):
        for z in range(9):
            if x == 4:
                blocks.place(WATER, pos(x + 2, -1, z + 2))
            else:
                blocks.place(FARMLAND, pos(x + 2, -1, z + 2))

player.on_chat("farm", on_on_chat)`,
      blocksNote: "外側に「x を 0〜8 でくりかえす」、内側に「z を 0〜8 でくりかえす」、その中に「もし x = 4 なら 水、でなければ 耕地」。発展：水は 4 マス先までとどくので、x % 9 == 4 にして 18 列の大きな畑にする／エージェントに種をまかせる。",
    },
  },

  // ----------------------------------------------------------
  {
    id: "q03-maze",
    area: "cave",
    tier: "advanced",
    order: 9,
    title: "地下迷宮からエージェントを脱出させよ",
    mapPos: { x: 82, y: 46 },
    prerequisites: ["q05-farm"],
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
  // ----------------------------------------------------------
  {
    id: "q06-castle",
    area: "cave",
    tier: "advanced",
    order: 10,
    title: "関数で城を建てよ",
    mapPos: { x: 80, y: 74 },
    prerequisites: ["q03-maze"],
    concepts: ["event", "function", "variable"],
    estimatedMinutes: 45,
    story: [
      { npc: "blacksmith", text: "迷宮をぬけたおまえに、たのみがある。村を守る城を建ててほしい。" },
      { npc: "blacksmith", text: "城の 4 すみには、同じ形の塔が 1 本ずつ。塔と塔のあいだは、城壁でつなぐんだ。" },
      { npc: "agent", text: "同じ塔を 4 回書くのはたいへん…。『塔の作り方』を関数にして、『どこに建てるか』だけ変えられたらいいのに！" },
    ],
    objective: "「どこに建てるか（x, z）」を受け取る関数 make_tower(x, z) を作って、城の 4 すみに塔を建て、塔のあいだを城壁でつなごう。",
    goals: [
      "チャットで「castle」と打つと城が建つ",
      "make_tower(x, z) を 1 回作って、4 回よび出す",
      "塔は 3×3、高さ 8 で、中が空洞になっている",
      "塔と塔のあいだが、城壁でつながっている",
    ],
    starter: {
      worldSetup: [
        "広い平地（20×20 以上）に立つ",
        "城は自分の少し前（x+2, z+2）から、15×15 の大きさで建ちます",
      ],
      blocks: [
        {
          category: "functions",
          label: "関数 make_tower (x, z)",
          children: [
            { category: "blocks", label: "石レンガ で (x, 0, z) から (〇, 7, 〇) まで うめる（空洞）", blank: true },
          ],
        },
        {
          category: "player",
          label: "チャットコマンド「castle」を入力したとき",
          children: [
            { category: "functions", label: "make_tower (2, 2) を呼び出す" },
            { category: "functions", label: "〇〇 ← のこり 3 つのすみ", blank: true },
            { category: "blocks", label: "〇〇 ← 塔のあいだの城壁", blank: true },
          ],
        },
      ],
      python: `def make_tower(x, z):
    # 3×3、高さ 8 の、中が空洞の塔を (x, z) に建てる
    blocks.fill(STONE_BRICKS,
        pos(x, 0, z),
        pos(______, 7, ______),   # 反対側の角は？
        FillOperation.HOLLOW)

def on_on_chat():
    make_tower(2, 2)
    # ▼ のこり 3 つのすみにも塔を建てよう（城は 15×15）

    # ▼ 塔と塔のあいだに、高さ 5 の城壁をつくろう

player.on_chat("castle", on_on_chat)`,
    },
    hints: [
      {
        level: 1,
        kind: "observe",
        title: "方眼紙に城をかこう",
        body: "15×15 の城を方眼紙にかいて、4 すみの塔がどこに来るか、左下の角の座標を書きこもう。まずは make_tower(2, 2) だけで実行して、塔が 3×3 になっているか見てみよう。",
      },
      {
        level: 2,
        kind: "focus",
        title: "関数は「作り方」",
        body: "関数の中身は 1 つのまま、よび出すときの（x, z）だけを変えれば、ちがう場所に同じ塔が建つよ。3 マスの塔なら、反対側の角は「始まり + 2」（はしのマスも数に入れる）。",
      },
      {
        level: 3,
        kind: "partial",
        title: "よび出しのかたち",
        body: "城が 15 マスなら、反対側の塔の始まりは 2 + 15 − 3 = 14。城壁も blocks.fill でうめられるよ。",
        snippet: `make_tower(2, 2)
make_tower(__, 2)
make_tower(2, __)
make_tower(__, __)
blocks.fill(STONE_BRICKS, pos(5, 0, 3), pos(13, 4, 3), FillOperation.REPLACE)`,
      },
    ],
    validation: {
      codeRules: [
        { type: "contains", pattern: String.raw`player\.on_chat\(\s*["']castle["']`, message: "チャットコマンド「castle」が見つからないよ" },
        { type: "contains", pattern: String.raw`def\s+make_tower\(\s*\w+\s*,\s*\w+\s*\)`, message: "（x, z）を受け取る関数 make_tower が見つからないよ" },
        { type: "minCount", pattern: String.raw`^\s*make_tower\(`, flags: "m", min: 4, message: "make_tower を 4 回よび出して、4 すみに塔を建てよう" },
        { type: "contains", pattern: String.raw`FillOperation\.HOLLOW`, message: "塔の中を空洞にする HOLLOW が見つからないよ" },
        { type: "contains", pattern: String.raw`\bx\s*\+\s*2\b|\b2\s*\+\s*x\b`, message: "塔の反対側の角は x + いくつ？ 3×3 になるように考えよう" },
        { type: "minCount", pattern: String.raw`blocks\.fill\(`, min: 2, message: "城壁がまだないみたい。塔と塔のあいだも fill でうめよう" },
      ],
      observations: [
        "4 すみに、同じ高さの塔が建った",
        "塔の中に入ると、空洞になっていた",
        "塔と塔のあいだが、城壁でつながった",
      ],
    },
    reward: { exp: 400, noHintBonus: 120, badgeId: "castle-lord", unlock: { type: "title", id: "castle-architect" } },
    solution: {
      python: `def make_tower(x, z):
    blocks.fill(STONE_BRICKS,
        pos(x, 0, z),
        pos(x + 2, 7, z + 2),
        FillOperation.HOLLOW)

def on_on_chat():
    make_tower(2, 2)
    make_tower(14, 2)
    make_tower(2, 14)
    make_tower(14, 14)
    blocks.fill(STONE_BRICKS, pos(5, 0, 3), pos(13, 4, 3), FillOperation.REPLACE)
    blocks.fill(STONE_BRICKS, pos(5, 0, 15), pos(13, 4, 15), FillOperation.REPLACE)
    blocks.fill(STONE_BRICKS, pos(3, 0, 5), pos(3, 4, 13), FillOperation.REPLACE)
    blocks.fill(STONE_BRICKS, pos(15, 0, 5), pos(15, 4, 13), FillOperation.REPLACE)

player.on_chat("castle", on_on_chat)`,
      blocksNote: "「関数」カテゴリで引数 x, z つきの関数を作り、中に「うめる（空洞）」を 1 つ入れる。発展：make_tower に高さ h の引数を足す／城壁も make_wall(x1, z1, x2, z2) の関数にする／塔のてっぺんをギザギザ（胸壁）にする。",
    },
  },

  // ----------------------------------------------------------
  {
    id: "q11-rainbow",
    area: "meadow",
    tier: "advanced",
    order: 11,
    title: "虹の道をつくれ",
    mapPos: { x: 60, y: 86 },
    prerequisites: ["q06-castle"],
    concepts: ["event", "list", "loop", "variable"],
    estimatedMinutes: 35,
    story: [
      { npc: "sage", text: "城の完成おめでとう。お祝いに、城から草原まで 7 色の虹の道をしこう。" },
      { npc: "sage", text: "赤・オレンジ・黄・黄緑・水色・青・むらさき。色の名前を 7 回も書き分けるのはたいへんじゃな。" },
      { npc: "agent", text: "色をまとめて入れておける「リスト」を使えば、くりかえしで 1 色ずつ取り出せるよ！" },
    ],
    objective: "7 色の羊毛をリストにまとめ、くりかえしで 1 色ずつ取り出して、7 本のしまもようの「虹の道」を作ろう。",
    goals: [
      "チャットで「rainbow」と打つと、虹の道ができる",
      "7 色の羊毛をリスト（colors）に入れる",
      "くりかえしの中で、リストから i 番目の色を取り出して使う（fill は 1 回だけ書く）",
    ],
    starter: {
      worldSetup: [
        "広い平地に立つ（前に 20 マス以上あいている場所）",
        "道は自分の 2 マス前から、足もとの高さに、前へむかってのびます",
      ],
      blocks: [
        {
          category: "player",
          label: "チャットコマンド「rainbow」を入力したとき",
          children: [
            { category: "variables", label: "変数 colors を リスト［赤の羊毛, オレンジの羊毛, 黄色の羊毛, 〇〇］にする", blank: true },
            { category: "blocks", label: "colors の 0 番目 で (0, -1, 2) から (0, -1, 22) までうめる" },
            { category: "loops", label: "〇〇 ← 7 色ぶん、1 列ずつ横にずらすには？", blank: true },
          ],
        },
      ],
      python: `def on_on_chat():
    colors = [RED_WOOL, ORANGE_WOOL, YELLOW_WOOL]
    # ▼ のこりの色もリストに入れよう（黄緑・水色・青・むらさき）
    # ▼ いまは 1 列だけ。7 色ぶん、1 列ずつ横にずらしたい
    blocks.fill(colors[0], pos(0, -1, 2), pos(0, -1, 22), FillOperation.REPLACE)

player.on_chat("rainbow", on_on_chat)`,
    },
    hints: [
      {
        level: 1,
        kind: "observe",
        title: "リストの番号",
        body: "colors[0] は赤、colors[1] はオレンジ…。リストの番号は 0 からはじまるよ。7 色なら、いちばん最後の番号はいくつかな？",
      },
      {
        level: 2,
        kind: "focus",
        title: "番号をくりかえしで変える",
        body: "くりかえしの i は 0, 1, 2…と変わるね。色の番号と、道の列（x）の両方に i を使えば、1 色ずつ横にずれていくよ。",
      },
      {
        level: 3,
        kind: "partial",
        title: "コードのかたち",
        body: "len(colors) を使うと、リストの長さ（色の数）がわかるよ。",
        snippet: `for i in range(len(colors)):
    blocks.fill(colors[__], pos(__, -1, 2), pos(__, -1, 22), FillOperation.REPLACE)`,
      },
    ],
    validation: {
      codeRules: [
        { type: "contains", pattern: String.raw`player\.on_chat\(\s*["']rainbow["']`, message: "チャットコマンド「rainbow」が見つからないよ" },
        { type: "contains", pattern: String.raw`=\s*\[`, message: "色をまとめるリスト（colors = [ ... ]）が見つからないよ" },
        { type: "minCount", pattern: String.raw`\b[A-Z_]+_WOOL\b`, min: 7, message: "7 色ぜんぶリストに入っているかな？" },
        { type: "contains", pattern: String.raw`\bfor\b`, message: "くりかえしが見つからないよ" },
        { type: "contains", pattern: String.raw`\w+\[\s*[a-z_]\w*\s*\]|for\s+\w+\s+in\s+[a-z_]\w*\s*:`, message: "リストから、くりかえしの番号（i）で色を取り出そう" },
        { type: "maxCount", pattern: String.raw`blocks\.fill\(`, max: 1, message: "fill が何回も書かれているよ。くりかえしにまとめよう" },
      ],
      observations: [
        "7 色のしまもようの道ができた",
        "色の順番が、虹と同じ（赤・オレンジ・黄・黄緑・水色・青・むらさき）",
        "道の上を歩いて、はしまで行けた",
      ],
    },
    reward: { exp: 400, noHintBonus: 120, badgeId: "rainbow-maker" },
    solution: {
      python: `def on_on_chat():
    colors = [RED_WOOL, ORANGE_WOOL, YELLOW_WOOL, LIME_WOOL, LIGHT_BLUE_WOOL, BLUE_WOOL, PURPLE_WOOL]
    for i in range(len(colors)):
        blocks.fill(colors[i], pos(i, -1, 2), pos(i, -1, 22), FillOperation.REPLACE)

player.on_chat("rainbow", on_on_chat)`,
      blocksNote: "「配列」の「リストを作成」に 7 色を入れ、「くりかえし（i を 0 から 6）」の中で「リストの i 番目」を fill のブロックに入れる。発展：リストの順番を変えて、ほかのもようにする／道を空中にかけて、本物の虹の形（アーチ）にする。",
    },
  },

  // ----------------------------------------------------------
  {
    id: "q12-town",
    area: "meadow",
    tier: "advanced",
    order: 12,
    title: "関数で町をつくれ",
    mapPos: { x: 50, y: 64 },
    prerequisites: ["q11-rainbow"],
    concepts: ["event", "function", "loop", "variable"],
    estimatedMinutes: 45,
    story: [
      { npc: "blacksmith", text: "城と虹の道ができて、この国にたくさんの人が引っこしてくることになった。" },
      { npc: "blacksmith", text: "同じ形の家を 5 けん、8 マスおきにならべて、城下町をつくってくれ。これが最後のクエストだ！" },
      { npc: "agent", text: "家の作り方は関数 make_house にまとめて、建てる場所はくりかえしの i でずらす。いままで覚えたことの組み合わせだね！" },
    ],
    objective: "関数 make_house(x, z) で入口のある家を作り、くりかえしで 8 マスおきに 5 けん建てて、城下町をつくろう。",
    goals: [
      "チャットで「town」と打つと、町ができる",
      "make_house(x, z) の中で、家（5×5・高さ 4・中は空洞）と入口のあなを作る",
      "くりかえしの中で make_house を 1 回だけよび出し、8 マスおきに 5 けん建てる",
    ],
    starter: {
      worldSetup: [
        "広い平地（45×10 以上）に立つ",
        "町は自分の少し前（x+2, z+2）から、x の方向（右）にならびます",
      ],
      blocks: [
        {
          category: "functions",
          label: "関数 make_house (x, z)",
          children: [
            { category: "blocks", label: "オークの板 で (x, 0, z) から (x+4, 3, z+4) まで うめる（空洞）" },
            { category: "blocks", label: "〇〇 ← 入口のあな（空気）", blank: true },
          ],
        },
        {
          category: "player",
          label: "チャットコマンド「town」を入力したとき",
          children: [
            { category: "functions", label: "make_house (2, 2) を呼び出す" },
            { category: "loops", label: "〇〇 ← 8 マスおきに 5 けん", blank: true },
          ],
        },
      ],
      python: `def make_house(x, z):
    # 5×5、高さ 4 の、中が空洞の家
    blocks.fill(PLANKS_OAK, pos(x, 0, z), pos(x + 4, 3, z + 4), FillOperation.HOLLOW)
    # ▼ このままだと中に入れない。入口のあなをあけよう

def on_on_chat():
    make_house(2, 2)
    # ▼ いまは 1 けんだけ。くりかえしで 8 マスおきに 5 けん建てたい

player.on_chat("town", on_on_chat)`,
    },
    hints: [
      {
        level: 1,
        kind: "observe",
        title: "家に入れる？",
        body: "今のコードで建った家に、入ってみよう。入れないのはなぜ？ 5 けんの家の左はしの x は、それぞれいくつになればいいか、表にしてみよう。",
      },
      {
        level: 2,
        kind: "focus",
        title: "いままでの組み合わせ",
        body: "入口は、かべの一部を「空気（AIR）」でうめればあくよ。建てる場所は「たいまつ」のクエストと同じで、くりかえしの i に 8 をかければ 8 マスずつずれるね。",
      },
      {
        level: 3,
        kind: "partial",
        title: "コードのかたち",
        body: "入口は家の前のかべのまん中（x + 2）に、高さ 2 マスであけよう。",
        snippet: `blocks.fill(AIR, pos(x + 2, 0, z), pos(x + 2, 1, z), FillOperation.REPLACE)

for i in range(__):
    make_house(2 + i * __, 2)`,
      },
    ],
    validation: {
      codeRules: [
        { type: "contains", pattern: String.raw`player\.on_chat\(\s*["']town["']`, message: "チャットコマンド「town」が見つからないよ" },
        { type: "contains", pattern: String.raw`def\s+make_house\(\s*\w+\s*,\s*\w+\s*\)`, message: "（x, z）を受け取る関数 make_house が見つからないよ" },
        { type: "contains", pattern: String.raw`\bAIR\b`, message: "入口のあな（AIR）が見つからないよ" },
        { type: "contains", pattern: String.raw`\bfor\b`, message: "くりかえしが見つからないよ" },
        { type: "contains", pattern: String.raw`range\(\s*5\s*\)`, message: "家は 5 けんになっているかな？" },
        { type: "contains", pattern: String.raw`make_house\([^)\n]*\*\s*8|make_house\([^)\n]*\b8\s*\*`, message: "建てる場所が、i といっしょに 8 マスずつずれていないよ" },
        { type: "maxCount", pattern: String.raw`^\s*make_house\(`, flags: "m", max: 1, message: "make_house を何回も書かずに、くりかえしの中で 1 回だけよぼう" },
      ],
      observations: [
        "家が 5 けん、同じ間かくでならんだ",
        "どの家にも入口があって、中に入れた",
        "5 けんとも、同じ形・同じ大きさだった",
      ],
    },
    reward: { exp: 500, noHintBonus: 150, badgeId: "town-builder", unlock: { type: "title", id: "town-mayor" } },
    solution: {
      python: `def make_house(x, z):
    blocks.fill(PLANKS_OAK, pos(x, 0, z), pos(x + 4, 3, z + 4), FillOperation.HOLLOW)
    blocks.fill(AIR, pos(x + 2, 0, z), pos(x + 2, 1, z), FillOperation.REPLACE)

def on_on_chat():
    for i in range(5):
        make_house(2 + i * 8, 2)

player.on_chat("town", on_on_chat)`,
      blocksNote: "関数 make_house の中に「うめる（空洞）」と「空気でうめる（入口）」を入れ、チャットコマンドの中の「くりかえし（i を 0 から 4）」で make_house(2 + i × 8, 2) をよぶ。発展：二重ループで 2 列の町にする／屋根を作る関数 make_roof を足す／家の色をリストから選ぶ。",
    },
  },
];

/** マップに「？」で表示する今後のクエスト（期待感の演出）。いまは予告なし */
export const TEASERS: { id: string; title: string; area: Quest["area"]; mapPos: { x: number; y: number } }[] = [];

export const getQuest = (id: string) => QUESTS.find((q) => q.id === id);
