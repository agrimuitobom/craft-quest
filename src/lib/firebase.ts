// ============================================================
// Firebase 初期化（クライアント専用）
// 設定値は .env.local / GitHub Secrets の NEXT_PUBLIC_FIREBASE_* から読む。
// 未設定のときは「ローカルモード」（LocalStorage のみ）で動く。
// ============================================================
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** 学校の Google Workspace ドメイン（例: example.ed.jp）。空なら制限なし */
export const ALLOWED_DOMAIN = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN ?? "").trim().toLowerCase();

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

export function getFirebase() {
  if (!isFirebaseConfigured) return null;
  if (typeof window === "undefined") return null;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(config);
    auth = getAuth(app);
    // 校内Wi-Fiが不安定でも動くよう、オフラインキャッシュを有効化（再接続時に自動送信）
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
    if (process.env.NEXT_PUBLIC_USE_EMULATORS === "1") {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
    }
  }
  return { app: app!, auth: auth!, db: db! };
}

export function googleProvider() {
  const p = new GoogleAuthProvider();
  // hd: 学校ドメインのアカウントを優先表示（※表示上のヒント。実際の制限はセキュリティルールで行う）
  p.setCustomParameters({ prompt: "select_account", ...(ALLOWED_DOMAIN ? { hd: ALLOWED_DOMAIN } : {}) });
  return p;
}

export function isAllowedEmail(email?: string | null) {
  if (!ALLOWED_DOMAIN) return true;
  return !!email && email.toLowerCase().endsWith("@" + ALLOWED_DOMAIN);
}
