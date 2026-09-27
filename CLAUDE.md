# CLAUDE.md

Minecraft Education と並べて使うクエスト型プログラミング学習アプリ「クラフトクエスト」。
対象は小中学生（初学者〜中級者）。UI の文言はひらがな多め・短い文で書く。

**作業を始める前に `docs/HANDOFF.md`（経緯・未確認事項・次にやること）を読むこと。**

## スタック

- Next.js 15（App Router）+ TypeScript + Tailwind CSS 3 + lucide-react
- `output: "export"` の静的書き出し → Firebase Hosting（`out/`）
- Firebase Authentication（Google。ドメイン制限は `allowedDomains()` で切り替え、いまは制限なし）+ Firestore（asia-northeast1）
- Firebase の設定値はリポジトリの `.env`（公開値）。`.env.local` に `NEXT_PUBLIC_FIREBASE_API_KEY=` と書くと「ローカルモード」（LocalStorage 保存・ログインなし）で動く
- CI（deploy.yml）で `NEXT_PUBLIC_*` の env を設定しない（空文字でも `.env` より優先されてしまう）

## コマンド

- `npm run dev` / `npm run build`
- `npm run test:rules` … Firestore ルールのテスト（Java 必須）。ルールを変えたら必ず実行
- `npm run test:quests` … クエスト定義とつまずき分析（`src/lib/analytics.ts`）のテスト。クエストを変えたら必ず実行
- `npm run emulators` + `.env.local` に `NEXT_PUBLIC_USE_EMULATORS=1` でローカル検証
- `npm run deploy:rules` … ルールの本番反映（CI では反映しない）

## 構成の要点

- クエスト定義：`src/data/quests.ts`（型は `src/types/quest.ts`、スキーマは `docs/quest.schema.json`）
- 進捗の状態遷移は `src/lib/progress.ts` の純粋関数。React からは `ProgressProvider` 経由でのみ触る
- Firestore：`users/{uid}`（進捗）、`users/{uid}/events`（追記のみの学習ログ）、`teachers/{email}`（先生名簿）
- 先生判定は `teachers/{email}` の存在のみ。先生は閲覧のみで書き換え不可
- Firestore に保存するフィールドを増やしたら、`firestore.rules` の `validUserDoc` / `hasOnly` とテストも更新する

## 規約

- ヒントは答えを直接教えない（観察 → 焦点 → 穴あきコードの3段階）
- 検証ルールの message は「何が足りないか」だけを伝える
- マイクラのコードは MakeCode for Minecraft の Python 表記に合わせる
- 生徒の個人情報は増やさない（メール・Google 表示名・クラス・番号・ニックネームまで）
- 仕様は `docs/SPEC.md`、公開手順は `docs/DEPLOY.md` に反映する
