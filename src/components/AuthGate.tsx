"use client";

import { useState } from "react";
import { GraduationCap, LogIn, LogOut, TriangleAlert } from "lucide-react";
import { useProgress } from "./ProgressProvider";
import { AgentAvatar } from "./AgentAvatar";
import { ALLOWED_DOMAIN } from "@/lib/firebase";
import type { StudentProfile } from "@/types/quest";

/** ログイン状態に応じて、ログイン画面／プロフィール登録／アプリ本体を出し分ける */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { authState } = useProgress();

  if (authState === "ready") return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <p className="mb-6 flex items-center justify-center gap-2 font-pixel text-3xl text-grass-400">
          <span aria-hidden className="inline-block h-8 w-8 rounded-sm bg-grass-500 shadow-block" />
          クラフトクエスト
        </p>
        {authState === "loading" && <div className="panel animate-pulse text-center">読み込み中…</div>}
        {authState === "signed-out" && <LoginCard />}
        {authState === "wrong-domain" && <WrongDomainCard />}
        {authState === "needs-profile" && <ProfileCard />}
        {authState === "error" && <ErrorCard />}
      </div>
    </div>
  );
}

function LoginCard() {
  const { signIn } = useProgress();
  return (
    <div className="panel flex flex-col items-center gap-4 text-center">
      <AgentAvatar size={80} bob />
      <p className="leading-relaxed">
        {ALLOWED_DOMAIN ? "学校の " : ""}Google アカウントでログインしてね。
        <br />
        クエストの進みぐあいが保存されて、どのパソコンからでもつづきができるよ。
      </p>
      <button onClick={signIn} className="btn-grass w-full text-xl">
        <LogIn aria-hidden /> Google でログイン
      </button>
      {ALLOWED_DOMAIN && <p className="text-xs text-white/60">@{ALLOWED_DOMAIN} のアカウントが使えます</p>}
    </div>
  );
}

function WrongDomainCard() {
  const { user, signOut } = useProgress();
  return (
    <div className="panel flex flex-col items-center gap-4 text-center" role="alert">
      <TriangleAlert size={48} className="text-gold-400" aria-hidden />
      <p className="font-pixel text-lg">このアカウントは使えません</p>
      <p className="text-sm text-white/80">
        {user?.email} でログインしています。
        <br />
        {ALLOWED_DOMAIN
          ? `@${ALLOWED_DOMAIN} の学校アカウントでログインし直してください。`
          : "このがめんを先生に見せてください。"}
      </p>
      <button onClick={signOut} className="btn-stone w-full">
        <LogOut aria-hidden /> ログアウトして切り替える
      </button>
    </div>
  );
}

function ProfileCard() {
  const { user, saveProfile, isTeacher, enterPreview, signOut } = useProgress();
  const [className, setClassName] = useState("");
  const [num, setNum] = useState("");
  const [nickname, setNickname] = useState(user?.displayName?.split(/\s/)[0] ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const n = Number(num);
  const valid = className.trim().length > 0 && Number.isInteger(n) && n >= 1 && n <= 99 && nickname.trim().length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError("");
    const pf: StudentProfile = { className: className.trim(), studentNumber: n, nickname: nickname.trim().slice(0, 12) };
    try {
      await saveProfile(pf);
    } catch (err) {
      console.error(err);
      setError("保存できませんでした。先生に知らせてください。");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="panel space-y-4">
      <div className="flex items-center gap-3">
        <AgentAvatar size={48} />
        <div>
          <p className="font-pixel text-lg text-gold-300">はじめまして！</p>
          <p className="text-sm text-white/70">{user?.email}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed">先生があなたの進みぐあいを確認できるように、クラスと番号を教えてね。</p>

      <label className="block">
        <span className="text-sm">クラス</span>
        <input
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="例：1年A組"
          maxLength={20}
          required
          className="mt-1 w-full rounded-md border-2 border-stone-700 bg-stone-900 px-3 py-3 text-lg"
        />
      </label>
      <label className="block">
        <span className="text-sm">出席番号</span>
        <input
          value={num}
          onChange={(e) => setNum(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          placeholder="例：12"
          maxLength={2}
          required
          className="mt-1 w-full rounded-md border-2 border-stone-700 bg-stone-900 px-3 py-3 text-lg"
        />
      </label>
      <label className="block">
        <span className="text-sm">ニックネーム（アプリの中で表示される名前）</span>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={12}
          required
          className="mt-1 w-full rounded-md border-2 border-stone-700 bg-stone-900 px-3 py-3 text-lg"
        />
      </label>

      {error && <p className="text-sm text-redstone-400">{error}</p>}
      <button disabled={!valid || busy} className="btn-grass w-full text-xl">
        {busy ? "保存中…" : "ぼうけんをはじめる"}
      </button>

      {isTeacher && (
        <button type="button" onClick={enterPreview} className="btn-stone w-full text-sm">
          <GraduationCap size={18} aria-hidden /> 先生として確認する（進捗は保存しない）
        </button>
      )}
      <button type="button" onClick={signOut} className="w-full text-center text-sm text-white/60 underline">
        別のアカウントでログインする
      </button>
    </form>
  );
}

function ErrorCard() {
  const { signOut } = useProgress();
  return (
    <div className="panel flex flex-col items-center gap-4 text-center" role="alert">
      <TriangleAlert size={48} className="text-gold-400" aria-hidden />
      <p className="font-pixel text-lg">サーバーにつながりません</p>
      <p className="text-sm text-white/80">インターネットの接続を確認して、もう一度ためしてね。</p>
      <button onClick={() => window.location.reload()} className="btn-grass w-full">
        もう一度読み込む
      </button>
      <button onClick={signOut} className="w-full text-sm text-white/60 underline">
        ログアウト
      </button>
    </div>
  );
}
