# 引き継ぎメモ（Claude チャット → Claude Code）

作成：2026-09-26　／　リポジトリ：`agrimuitobom/craft-quest`（main）
このファイルを読めば、これまでの経緯を知らなくても作業を再開できるように書いています。

---

## 1. プロジェクトの概要

Minecraft Education（以下マイクラEE）の横に並べて使う、クエスト型のプログラミング学習 Web アプリです。

- **使い方：** 生徒はアプリでクエストを受注します。次に、マイクラEEの Code Builder（MakeCode）でプログラムを作って実行します。最後にアプリへ戻って報告し、クリアすると EXP・バッジ・称号・スキンがもらえます。
- **対象：** 小中学生の初学者〜中級者です。授業で使うのは西条農業高校の野田先生（リポジトリの持ち主）です。
- **マイクラとの連携：** マイクラ本体とは API で連携しません。クリア判定は次の 2 つの組み合わせです。
  - ① ゲーム内で見て確かめた結果に、生徒自身がチェックを入れる
  - ② 貼り付けたコード（MakeCode の Python タブからコピー）を正規表現で静的チェックする

詳しい設計は `docs/SPEC.md`、公開手順は `docs/DEPLOY.md`、開発上の約束は `CLAUDE.md` にあります。

## 2. ここまでに決まったこと

| 項目 | 決定 | 理由・補足 |
|---|---|---|
| ログイン | **Google アカウント（学校 Workspace ドメインのみ）** | 野田先生の指定。ドメインは画面の表示と `firestore.rules` の両方で制限する |
| コード管理 | **GitHub**（`agrimuitobom/craft-quest`） | 野田先生の指定 |
| ホスティング | **Firebase Hosting** | GitHub Pages ではなく、Firebase にまとめる方針 |
| バックエンド | **Firestore（asia-northeast1 / 東京）** | 無料の Spark プランで収まる想定 |
| 公開の流れ | main に push → GitHub Actions（ルールのテスト → ビルド → Hosting へ公開） | Pull Request ではプレビュー用の URL を発行する |
| Next.js | `output: "export"` の静的書き出し | Hosting に置くため。`/quest/[id]` は `generateStaticParams` で事前に生成する |
| 先生の判定 | Firestore の `teachers/{メールアドレス}` が存在するか | コンソールで手動登録する。先生は閲覧のみで、書き換えはできない |
| 旧・先生モード（PIN） | **廃止** | 先生アカウントでの判定に置き換えた |
| ローカルモード | `.env.local` がないときは LocalStorage 保存・ログインなしで動く | 開発とデモ用。このモードでは模範解答が常に表示される |

## 3. いまの実装状況

### できているもの（v0.2）

- ワールドマップ、クエスト一覧、クエスト詳細の各画面
  - クエスト詳細：NPC との会話、ブロック／Python のひな形、3 段階ヒント（デバッグ道場）、クリア報告
- クリア演出（EXP のカウントアップ、レベルアップ、バッジの獲得）と、実績画面（バッジ・称号・スキン）
- サンプルクエスト 3 本（`src/data/quests.ts`）：柵ならべ（初級）、ピラミッド（中級）、迷路脱出の右手法（上級）
- Google ログイン（`AuthGate`）と初回のプロフィール登録（クラス・出席番号・ニックネーム）
  - 端末に残っていたローカルの進捗は、登録時に引き継ぐ
- Firestore への保存
  - `users/{uid}` に進捗を保存する（0.5 秒のデバウンス、タブを隠したときにも送信、オフラインキャッシュあり）
  - `users/{uid}/events` に学習ログ（start / hint / fail / clear）を追記する
- 先生用画面 `/teacher`：クエストごとのクリア数、ヒント段階の分布、声かけ候補、生徒一覧、CSV 出力（BOM 付き UTF-8）
- `firestore.rules` と、そのテスト 16 項目（`tests/firestore.rules.test.mjs`）
- `.github/workflows/deploy.yml`、`docs/DEPLOY.md`

### 確認済みのこと（クラウドの作業環境で実施）

- `tsc --noEmit` と `next build`（静的書き出し）が通る
- ローカルモードで、受注 → ヒント → 失敗 → 成功 → クリア演出 → 実績画面まで、Playwright で通しで操作できた
- 3 本の模範解答が検証を通過し、空欄の残ったひな形は不合格になる
- 状態遷移（ヒントなしでの再挑戦でマスターになる、など）の単体チェック
- ログイン画面が表示される（Firebase の設定を入れてビルドした状態で）

### 確認できていないこと（最優先で確認）

作業環境から Google のサーバーにつながらず、次の 2 と 3 はまだ動かせていません（1 は確認済み）。

1. ~~`npm run test:rules` を一度も実行できていない~~ → **2026-09-26 に実行し、16 項目すべて合格**
   - 原因は `node --test tests/` の書き方だった（Node 22 ではフォルダを指定できない）
   - `node --test tests/*.test.mjs` に直した。ルール本体の直しは不要だった
2. **実際の Google ログイン → Firestore 保存の流れ**
   - ポップアップのログインが apis.google.com に届かなかった
3. **GitHub Actions の初回の結果が未確認**
   - push は済んでいる
   - Variables と Secrets がまだ未登録なので、公開ジョブは失敗しているはず（想定どおり）

## 4. 次にやること（優先順）

### A. 動作確認と Firebase のセットアップ（野田先生と一緒に）

1. ~~`npm install` → `npm run test:rules`~~（済み。Java 11 以上が必要）
2. Firebase プロジェクトを作る（`docs/DEPLOY.md` の手順 1〜2）
   - Google ログインを有効化、Firestore を東京で作成、`teachers` に先生を登録
3. 学校ドメインを決めて、次の 2 か所を同じ値にそろえる
   - `firestore.rules` の `schoolDomain()`（いまは `'example.ed.jp'`）
   - `.env.local` の `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN`
   - ※ 実際のドメインはまだ聞いていない。**推測せず、野田先生に確認すること**
4. `.firebaserc` の `your-firebase-project-id` を書き換える → `npm run deploy:rules`
5. `.env.local` を作って `npm run dev` → 実際のアカウントでログイン・保存・先生画面を確認する
6. `npx firebase init hosting:github` → Secret の `FIREBASE_SERVICE_ACCOUNT` と Variables 7 つを登録 → Actions を緑にする
   - `firebase init` がワークフローファイルを追加で作ったら削除する（同梱の `deploy.yml` だけを使う）
7. `DEPLOY.md` の「授業前チェックリスト」を実施する
   - 特に、Workspace 側で外部アプリへのログインがブロックされていないか

### B. 気になっている点（直す候補）

- **Secret 名の手間：** `init hosting:github` が作る Secret は `FIREBASE_SERVICE_ACCOUNT_<ID>` という名前で、同梱のワークフローが使う名前と違う。いまは手で登録し直す手順にしている。ワークフロー側を合わせた方が楽かもしれない。
- **EXP の改ざん：** EXP の計算がブラウザ側なので、生徒が値を改ざんできる（ルールで型と範囲だけ制限している）。成績に使うなら Cloud Functions に移す必要があるが、そうすると Blaze プラン（従量課金）が必要になる。
- **先生の閲覧範囲：** 先生は全クラスを閲覧できる。担当クラスだけに絞るなら `teachers/{email}.classes` を追加する。
- **アプリ内のコードとマイクラの実際の API 名：** マイクラ用コードの API 名（`agent.detect`, `AgentInspection.BLOCK`, `LEFT_TURN`, `blocks.fill` など）は、実機の Code Builder で確認していない。
  - 野田先生に一度動かしてもらい、違っていれば `src/data/quests.ts` の starter・hints・solution・codeRules を直す。
- **ローカルモードの模範解答：** ローカルモードでは模範解答が誰にでも見える。本番は Firebase モードなので問題ないが、デモで生徒に見せるときは注意。
- **フォント：** Google Fonts を `<link>` で読んでいる。校内のネットワークで遮断される場合はシステムフォントで表示される（崩れはしない）。

### C. 機能の拡張候補（野田先生と相談のうえで）

- クエストの追加（マップに「？」で予告している 3 本：谷にかける橋、自動収穫ファーム、関数で城を建てよ）
- `events` を使ったつまずき分析（クエストごと・ヒント段階ごとの所要時間）
- クリア時の振り返りの一言入力（メタ認知）
  - 保存項目が増えるので、ルールとテストの更新が必要
- 先生が JSON からクエストを追加できる画面

## 5. 触るときの注意（CLAUDE.md の要点）

- Firestore に保存するフィールドを増やしたら、`firestore.rules` の `validUserDoc` / `hasOnly` とテストも更新する
- 生徒の個人情報は増やさない（メール、Google の表示名、クラス、番号、ニックネームまで）
- ヒントは答えを直接教えない。検証の message は「何が足りないか」だけを伝える
- UI の文言は、小中学生向けにひらがな多め・短い文で書く
- 進捗の状態遷移は `src/lib/progress.ts` の純粋関数でだけ行う
- ルールは CI では反映されない。変えたら `npm run deploy:rules` を実行する

## 6. 主なファイル

```
src/components/ProgressProvider.tsx  ログイン状態・進捗の読み込みと保存（cloud / local）
src/components/AuthGate.tsx          ログイン、ドメイン違い、プロフィール登録、通信エラーの各画面
src/lib/firebase.ts                  初期化（環境変数、エミュレーターへの接続、ドメインの判定）
src/lib/progress.ts                  状態遷移と報酬の計算
src/lib/validator.ts                 コードの静的チェック
src/app/teacher/page.tsx             先生用の画面
src/data/quests.ts                   クエスト定義
firestore.rules / tests/             セキュリティルールとテスト
.github/workflows/deploy.yml         CI/CD
```

---

## Claude Code への最初の指示（コピー用）

```
docs/HANDOFF.md を読んで、今の状況を把握してください。
まず「確認できていないこと」の 1 番として npm run test:rules を実行し、
失敗したら原因を調べて直してください。
そのあと Firebase のセットアップ（HANDOFF の 4-A）を、私と一緒に 1 手順ずつ進めてください。
学校のドメインは私が伝えるまで推測しないでください。
```
