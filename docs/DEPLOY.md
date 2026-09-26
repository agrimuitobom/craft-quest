# 公開手順（GitHub ＋ Firebase）

全体の流れ：**GitHub にコードを置く → main に push → GitHub Actions がテスト・ビルド → Firebase Hosting に自動公開**

```
先生のPC ──push──▶ GitHub (main)
                     │ GitHub Actions
                     ├─ ① セキュリティルールのテスト（エミュレーター）
                     ├─ ② npm run build（out/ に静的HTML）
                     └─ ③ Firebase Hosting へ公開 → https://<プロジェクトID>.web.app
生徒のPC ──Googleログイン──▶ Firebase Auth / Firestore（進捗を保存）
```

所要時間の目安：初回 40〜60 分。作業はすべて先生の Google アカウント（Firebase の管理者になるアカウント）で行います。

---

## 1. Firebase プロジェクトを作る（コンソール）

1. https://console.firebase.google.com/ →「プロジェクトを作成」
   - 名前：`craft-quest` など（**プロジェクトID** を控える。例 `craft-quest-1a2b3`）
   - Google アナリティクス：オフで OK
2. **Authentication** →「始める」→ ログイン方法 →「Google」を有効化
   - サポートメール：先生のアドレス
3. **Firestore Database** →「データベースを作成」
   - ロケーション：**asia-northeast1（東京）** ※あとから変更できません
   - 「本番環境モード」で開始（ルールは手順 4 で上書きします）
4. **プロジェクトの設定（歯車）→ マイアプリ →「</>（ウェブ）」** でアプリを登録
   - 「Firebase Hosting も設定」にチェック
   - 表示される `firebaseConfig` の 6 つの値を控える（apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId）

> プランは無料の **Spark** のままで使えます。

## 2. 先生を登録する（Firestore）

Firestore →「コレクションを開始」

- コレクション ID：`teachers`
- ドキュメント ID：**先生の Google メールアドレス（すべて小文字）** 例 `noda@example.ed.jp`
- フィールド：`name`（string）＝ 先生の名前

先生を増やすときは同じようにドキュメントを追加します。登録された先生は、全生徒の進捗閲覧・模範解答の表示ができます。

## 3. 手元の準備

```bash
# Node.js 20 以上が必要
unzip craft-quest.zip && cd craft-quest
npm install
npx firebase login          # ブラウザで先生のアカウントを選ぶ
```

`.firebaserc` の `your-firebase-project-id` を手順 1 のプロジェクトIDに書き換えます。

## 4. 学校ドメインを設定してルールを公開

1. `firestore.rules` の次の行を学校の Google Workspace ドメインに書き換える

   ```
   function schoolDomain() {
     return 'example.ed.jp';   // ← 生徒のメールの @ より後ろ
   }
   ```

2. ルールを公開

   ```bash
   npm run deploy:rules
   ```

> ルールはコードの自動公開（手順 6）には含まれません。`firestore.rules` を変えたときは、このコマンドを手動で実行してください。

## 5. 手元で動作確認（任意）

```bash
cp .env.example .env.local   # 手順 1-4 の 6 つの値とドメインを記入
npm run dev                  # http://localhost:3000
```

- `http://localhost` は Firebase Authentication の「承認済みドメイン」に最初から入っているので、そのままログインできます
- `.env.local` がないと「ローカルモード」（ログインなし・ブラウザ保存）で起動します

## 6. GitHub に置いて自動公開を設定

### 6-1. リポジトリを作って push

GitHub で空のリポジトリ（例 `craft-quest`）を作成し：

```bash
git init -b main           # zip に .git が含まれていれば不要
git add . && git commit -m "first commit"
git remote add origin https://github.com/<ユーザー名>/craft-quest.git
git push -u origin main
```

この時点では、まだ設定が足りないため Actions は失敗します（次の 6-2, 6-3 で直ります）。

### 6-2. デプロイ用の鍵を GitHub に登録（コマンド 1 つ）

```bash
npx firebase init hosting:github
```

質問には次のように答えます。

| 質問 | 回答 |
|---|---|
| For which GitHub repository… | `<ユーザー名>/craft-quest` |
| Set up the workflow to run a build script before every deploy? | **No**（ワークフローは同梱済み） |
| Set up automatic deployment to your site's live channel when a PR is merged? | **No** |

これで GitHub の Secrets に `FIREBASE_SERVICE_ACCOUNT_<プロジェクトID>` という名前の鍵が登録されます。
GitHub のリポジトリ → **Settings → Secrets and variables → Actions → Secrets** で、この値を **`FIREBASE_SERVICE_ACCOUNT`** という名前でもう 1 つ登録し直してください（同梱のワークフローはこの名前を使います）。
※ 上書きが面倒な場合は `.github/workflows/deploy.yml` の `secrets.FIREBASE_SERVICE_ACCOUNT` を、作成された名前に書き換えても OK です。

> `firebase init` が `.github/workflows/` に別のファイルを作った場合は削除してください（同梱の `deploy.yml` だけを使います）。

### 6-3. Firebase の設定値を登録

リポジトリ → **Settings → Secrets and variables → Actions → Variables** タブ →「New repository variable」で 7 つ登録：

| Name | 値 |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | apiKey |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | authDomain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | projectId |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | storageBucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | appId |
| `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` | 学校ドメイン（firestore.rules と同じ） |

> これらは Web ページに埋め込まれる公開値なので Variables で問題ありません。データの保護はセキュリティルールで行っています。

### 6-4. 公開

Actions タブ → 失敗した実行 →「Re-run all jobs」、または何か 1 つ commit して push。
緑になったら **`https://<プロジェクトID>.web.app`** で公開されています。

以後は **main に push するたびに自動で公開** されます。Pull Request を作ると、本番に影響しないプレビュー URL がコメントされます。

---

## 7. 授業前チェックリスト

- [ ] 生徒アカウントでログイン → クラス・番号入力 → クエストを 1 つクリアできる
- [ ] 学校ドメイン以外（個人 Gmail）でログインすると「このアカウントは使えません」になる
- [ ] 先生アカウントでログイン → ヘッダーに「先生」→ クラス一覧に上の生徒が出る
- [ ] 学校の Google Workspace 管理コンソールで、外部アプリ（Firebase / `*.firebaseapp.com`）へのログインがブロックされていない
  - ブロックされている場合は、Workspace 管理者に「API の制御 → アプリのアクセス制御」で許可を依頼
- [ ] 生徒端末のブラウザでポップアップがブロックされていない（ログインはポップアップで開きます）

## 8. 運用メモ

| やりたいこと | 方法 |
|---|---|
| 先生を追加 | Firestore の `teachers` にメールアドレスのドキュメントを追加 |
| 生徒の進捗をリセット・削除 | Firestore コンソールで `users/{uid}` を編集・削除（アプリからは不可） |
| 成績資料にしたい | 先生画面の「CSV」ボタン（Excel で開ける BOM 付き UTF-8） |
| 年度末の整理 | Firestore コンソールで `users` を削除、または CSV を保存してから削除 |
| クエストを追加 | `src/data/quests.ts` に追加して push |
| ルールを変更 | `firestore.rules` を編集 → `npm run deploy:rules` |
| 独自ドメインで公開 | Hosting →「カスタムドメインを追加」→ Authentication の承認済みドメインにも追加 |

## 保存されるデータ

| 場所 | 内容 |
|---|---|
| `users/{uid}` | メールアドレス、Google の表示名、クラス、出席番号、ニックネーム、進捗（EXP・クエスト状態・開いたヒント段階・報告回数・最後に貼ったコード・バッジ等） |
| `users/{uid}/events` | 学習ログ（受注／ヒント／失敗／クリアの種類・クエストID・時刻） |
| `teachers/{email}` | 先生の名簿 |

- 生徒は **自分のデータだけ** 読み書きでき、削除はできません
- 先生は **全員分を閲覧** できますが、書き換えはできません（改ざん防止）
- 学習ログは追記のみで、あとから書き換えられません
