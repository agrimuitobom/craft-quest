# クラフトクエスト

Minecraft: Education Edition の横に並べて使う、クエスト型プログラミング学習コンパニオンアプリです。
生徒は Google アカウントでログインし、進捗は Firebase（Firestore）に保存されます。

- 設計仕様：[`docs/SPEC.md`](docs/SPEC.md)
- **公開手順（GitHub ＋ Firebase）：[`docs/DEPLOY.md`](docs/DEPLOY.md)**
- クエストの JSON スキーマ：[`docs/quest.schema.json`](docs/quest.schema.json)

## すぐ試す（Firebase なし）

```bash
npm install
npm run dev     # → http://localhost:3000
```

`.env.local` がない状態では **ローカルモード**（ログインなし・進捗はブラウザに保存・模範解答は常に表示）で動きます。

## Firebase につなぐ

`.env.example` を `.env.local` にコピーして値を入れると、Google ログイン＋Firestore 保存に切り替わります。詳しくは [DEPLOY.md](docs/DEPLOY.md)。

## コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm run build` | 静的 HTML を `out/` に書き出し（Firebase Hosting 用） |
| `npm run test:rules` | Firestore セキュリティルールのテスト（Java 11 以上が必要。GitHub Actions でも自動実行） |
| `npm run emulators` | Auth / Firestore エミュレーターを起動（`.env.local` に `NEXT_PUBLIC_USE_EMULATORS=1`） |
| `npm run deploy:rules` | セキュリティルールを本番に反映 |

## 画面

| パス | 内容 |
|---|---|
| `/` | ワールドマップ・クエスト一覧 |
| `/quest/<id>/` | ストーリー・ミッション・ひな形・デバッグ道場（3段階ヒント）・クリア報告 |
| `/achievements/` | バッジ・称号・スキン・ニックネーム |
| `/teacher/` | 先生用：クラスの進捗・つまずき（声かけ候補）・CSV 出力 |

## ディレクトリ

```
src/
  app/                   画面
  components/            UI（WorldMap, HintAccordion, ClearModal, AuthGate …）
    ProgressProvider.tsx ログイン状態と進捗の読み書き（Firestore / LocalStorage）
  data/quests.ts         クエスト（ここに追加すればマップに出ます）
  data/rewards.ts        バッジ・称号・スキン・レベル表
  lib/firebase.ts        Firebase 初期化
  lib/progress.ts        進捗の状態遷移（純粋関数）
  lib/validator.ts       コードの静的チェック
firestore.rules          セキュリティルール（★allowedDomains() でログインできるドメインを決める）
tests/                   ルールのテスト
.github/workflows/       GitHub Actions（テスト → ビルド → Firebase Hosting）
```
