"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, type User } from "firebase/auth";
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import type { LearningEvent, StudentDoc, StudentProfile, UserProgress } from "@/types/quest";
import { initialProgress, loadProgress, saveProgress, STORAGE_KEY, touchStreak } from "@/lib/progress";
import { getFirebase, googleProvider, isAllowedEmail, isFirebaseConfigured } from "@/lib/firebase";

/**
 * 進捗の読み書きを一手に引き受ける Provider
 *
 * - cloud モード（Firebase 設定あり）: Google ログイン → Firestore users/{uid} に保存
 * - local モード（設定なし）        : 従来どおり LocalStorage に保存（開発・デモ用）
 */
export type AuthState = "loading" | "signed-out" | "wrong-domain" | "needs-profile" | "error" | "ready";

interface Ctx {
  mode: "cloud" | "local";
  authState: AuthState;
  user: User | null;
  profile: StudentProfile | null;
  isTeacher: boolean;
  /** 先生がプロフィール未作成で見ている状態（進捗は保存しない） */
  previewOnly: boolean;
  progress: UserProgress;
  hydrated: boolean;
  syncing: boolean;
  update: (fn: (p: UserProgress) => UserProgress) => void;
  reset: () => void;
  logEvent: (e: Omit<LearningEvent, "at">) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (p: StudentProfile) => Promise<void>;
  /** 先生がプロフィールを作らずにアプリを確認する */
  enterPreview: () => void;
}

const ProgressContext = createContext<Ctx | null>(null);
const SAVE_DELAY = 500;

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const mode: Ctx["mode"] = isFirebaseConfigured ? "cloud" : "local";
  const [authState, setAuthState] = useState<AuthState>(mode === "cloud" ? "loading" : "ready");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);

  /** Firestore から読み込み終わるまで書き込まない */
  const canSave = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<UserProgress | null>(null);

  // ---------- local モード ----------
  useEffect(() => {
    if (mode !== "local") return;
    setProgress(touchStreak(loadProgress()));
    setHydrated(true);
  }, [mode]);

  useEffect(() => {
    if (mode === "local" && hydrated) saveProgress(progress);
  }, [mode, progress, hydrated]);

  // ---------- cloud モード：ログイン状態の監視 ----------
  useEffect(() => {
    if (mode !== "cloud") return;
    const fb = getFirebase()!;
    return onAuthStateChanged(fb.auth, async (u) => {
      canSave.current = false;
      setUser(u);
      setProfile(null);
      setPreviewOnly(false);
      setHydrated(false);
      if (!u) {
        setIsTeacher(false);
        setAuthState("signed-out");
        return;
      }
      setAuthState("loading");

      // 先生判定（teachers/{email} が存在するか。自分のメールのドキュメントだけ読める）
      let teacher = false;
      try {
        teacher = !!u.email && (await getDoc(doc(fb.db, "teachers", u.email.toLowerCase()))).exists();
      } catch {
        teacher = false;
      }
      setIsTeacher(teacher);

      if (!teacher && !isAllowedEmail(u.email)) {
        setAuthState("wrong-domain");
        return;
      }

      try {
        const snap = await getDoc(doc(fb.db, "users", u.uid));
        if (snap.exists()) {
          const data = snap.data() as StudentDoc;
          setProfile(data.profile);
          setProgress(touchStreak({ ...initialProgress(), ...data.progress }));
          canSave.current = true;
          setHydrated(true);
          setAuthState("ready");
        } else {
          // 初回：この端末に以前の進捗があれば引き継ぐ
          setProgress(touchStreak(loadProgress()));
          setAuthState("needs-profile");
        }
      } catch (e) {
        // 権限エラー＝ルール上このアカウントは使えない／それ以外＝通信エラー
        console.error(e);
        const code = (e as { code?: string }).code;
        setAuthState(code === "permission-denied" ? "wrong-domain" : "error");
      }
    });
  }, [mode]);

  // ---------- cloud モード：進捗の自動保存（デバウンス） ----------
  const flush = useCallback(async () => {
    const fb = getFirebase();
    const p = pending.current;
    if (!fb || !user || !p) return;
    pending.current = null;
    setSyncing(true);
    try {
      await updateDoc(doc(fb.db, "users", user.uid), { progress: p, updatedAt: serverTimestamp() });
    } catch (e) {
      console.error("save failed", e);
    } finally {
      setSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    if (mode !== "cloud" || !canSave.current || previewOnly) return;
    pending.current = progress;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DELAY);
  }, [mode, progress, previewOnly, flush]);

  // タブを閉じる・切り替える直前に未送信分を送る
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden" && pending.current) flush();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [flush]);

  // ---------- 公開 API ----------
  const update = useCallback((fn: (p: UserProgress) => UserProgress) => setProgress((p) => fn(p)), []);

  const reset = useCallback(() => {
    // 生徒の Firestore データはリセットさせない（local モードのみ）
    if (mode !== "local") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setProgress(touchStreak(initialProgress()));
  }, [mode]);

  const logEvent = useCallback(
    (e: Omit<LearningEvent, "at">) => {
      const fb = getFirebase();
      if (!fb || !user || previewOnly || !canSave.current) return;
      const clean = Object.fromEntries(Object.entries(e).filter(([, v]) => v !== undefined));
      addDoc(collection(fb.db, "users", user.uid, "events"), { ...clean, at: serverTimestamp() }).catch((err) =>
        console.error("event log failed", err),
      );
    },
    [user, previewOnly],
  );

  const signIn = useCallback(async () => {
    const fb = getFirebase();
    if (!fb) return;
    try {
      await signInWithPopup(fb.auth, googleProvider());
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        alert("ログインできませんでした。ポップアップがブロックされていないか確認してください。");
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    const fb = getFirebase();
    if (pending.current) await flush();
    if (fb) await fbSignOut(fb.auth);
  }, [flush]);

  const saveProfile = useCallback(
    async (pf: StudentProfile) => {
      const fb = getFirebase();
      if (!fb || !user) {
        setProfile(pf);
        return;
      }
      const ref = doc(fb.db, "users", user.uid);
      if (authState === "needs-profile" || previewOnly) {
        const p = { ...progress, playerName: pf.nickname };
        const data: StudentDoc = {
          email: (user.email ?? "").toLowerCase(),
          googleName: user.displayName ?? "",
          profile: pf,
          progress: p,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(ref, data);
        setProgress(p);
        setPreviewOnly(false);
        canSave.current = true;
        setHydrated(true);
        setAuthState("ready");
        try {
          window.localStorage.removeItem(STORAGE_KEY); // 引き継ぎ済みのローカル進捗は削除
        } catch {}
      } else {
        await updateDoc(ref, { profile: pf, "progress.playerName": pf.nickname, updatedAt: serverTimestamp() });
        setProgress((p) => ({ ...p, playerName: pf.nickname }));
      }
      setProfile(pf);
    },
    [user, authState, previewOnly, progress],
  );

  const enterPreview = useCallback(() => {
    setPreviewOnly(true);
    setProgress(touchStreak(initialProgress()));
    setHydrated(true);
    setAuthState("ready");
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        mode,
        authState,
        user,
        profile,
        isTeacher: mode === "local" ? true : isTeacher,
        previewOnly,
        progress,
        hydrated,
        syncing,
        update,
        reset,
        logEvent,
        signIn,
        signOut,
        saveProfile,
        enterPreview,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}
