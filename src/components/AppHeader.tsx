"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, GraduationCap, LogOut, Map, Trophy } from "lucide-react";
import { useProgress } from "./ProgressProvider";
import { AgentAvatar } from "./AgentAvatar";
import { levelFromExp, UNLOCKABLES } from "@/data/rewards";

export function AppHeader() {
  const { progress, hydrated, isTeacher, mode, previewOnly, signOut, syncing, user } = useProgress();
  const pathname = usePathname();
  const { level, cur, next, ratio } = levelFromExp(progress.exp);
  const title = UNLOCKABLES.find((u) => u.id === progress.equippedTitle)?.name;

  const nav = [
    { href: "/", label: "マップ", Icon: Map },
    { href: "/achievements", label: "じっせき", Icon: Trophy },
    ...(isTeacher && mode === "cloud" ? [{ href: "/teacher", label: "先生", Icon: GraduationCap }] : []),
  ];

  return (
    <header className="sticky top-0 z-30 border-b-4 border-stone-700 bg-stone-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2">
        <Link href="/" className="flex items-center gap-2 font-pixel text-xl text-grass-400 sm:text-2xl">
          <span aria-hidden className="inline-block h-6 w-6 rounded-sm bg-grass-500 shadow-block" />
          クラフトクエスト
        </Link>

        {/* プレイヤーステータス */}
        <div className="order-3 flex w-full items-center gap-3 sm:order-none sm:ml-auto sm:w-auto">
          <AgentAvatar skin={progress.equippedSkin} size={36} />
          <div className="min-w-0 flex-1 sm:w-56 sm:flex-none">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-pixel text-base text-gold-300">Lv.{hydrated ? level : "-"}</span>
              <span className="truncate text-white/70">{title}</span>
            </div>
            <div
              className="mt-1 h-3 w-full overflow-hidden rounded-sm bg-stone-700"
              role="progressbar"
              aria-valuemin={cur}
              aria-valuemax={next}
              aria-valuenow={progress.exp}
              aria-label="経験値"
            >
              <div className="h-full bg-grass-400 transition-all duration-700" style={{ width: `${ratio * 100}%` }} />
            </div>
            <div className="mt-0.5 text-right text-[11px] text-white/60">
              EXP {progress.exp} / {next}
            </div>
          </div>
          {progress.streak.count > 0 && (
            <span className="flex items-center gap-1 rounded-md bg-stone-800 px-2 py-1 font-pixel text-sm text-orange-300" title="連続学習日数">
              <Flame size={16} aria-hidden /> {progress.streak.count}日
            </span>
          )}
        </div>

        <nav className="ml-auto flex gap-2 sm:ml-2">
          {nav.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-[44px] items-center gap-1 rounded-md px-3 font-pixel text-sm ${
                  active ? "bg-grass-600 text-white" : "bg-stone-800 text-white/80 hover:bg-stone-700"
                }`}
              >
                <Icon size={18} aria-hidden /> {label}
              </Link>
            );
          })}
          {user && (
            <button
              onClick={signOut}
              className="flex min-h-[44px] items-center gap-1 rounded-md bg-stone-800 px-3 text-sm text-white/70 hover:bg-stone-700"
              title={user.email ?? ""}
              aria-label="ログアウト"
            >
              <LogOut size={18} aria-hidden />
            </button>
          )}
        </nav>
      </div>
      {previewOnly && (
        <p className="bg-diamond-500 px-4 py-1 text-center text-sm text-stone-900">
          先生プレビュー中：この画面での進捗は保存されません
        </p>
      )}
      {mode === "local" && (
        <p className="bg-gold-400 px-4 py-1 text-center text-xs text-stone-900">
          ローカルモード（Firebase 未設定）：進捗はこのブラウザだけに保存されます
        </p>
      )}
      {syncing && <span className="sr-only">保存中</span>}
    </header>
  );
}
