"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, Check, GraduationCap, Lock, RotateCcw, Save, Shirt, Trophy } from "lucide-react";
import { useProgress } from "@/components/ProgressProvider";
import { AgentAvatar } from "@/components/AgentAvatar";
import { BadgeIcon } from "@/components/BadgeIcon";
import { BADGES, levelFromExp, UNLOCKABLES } from "@/data/rewards";
import { QUESTS } from "@/data/quests";
import { getStatus, isCleared } from "@/lib/progress";

export default function AchievementsPage() {
  const { progress, update, reset, hydrated, isTeacher, mode, profile, saveProfile, previewOnly } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const [nick, setNick] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  if (!hydrated) return <div className="panel animate-pulse">読み込み中…</div>;

  const { level } = levelFromExp(progress.exp);
  const cleared = QUESTS.filter((q) => isCleared(getStatus(progress, q))).length;
  const mastered = QUESTS.filter((q) => getStatus(progress, q) === "mastered").length;
  const titles = UNLOCKABLES.filter((u) => u.type === "title");
  const skins = UNLOCKABLES.filter((u) => u.type === "skin");

  return (
    <div className="space-y-6">
      <section className="panel flex flex-col items-center gap-4 sm:flex-row">
        <AgentAvatar skin={progress.equippedSkin} size={96} bob />
        <div className="flex-1 text-center sm:text-left">
          <label htmlFor="pname" className="text-xs text-white/60">
            ニックネーム
          </label>
          {mode === "cloud" && profile ? (
            <form
              className="flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const v = (nick ?? profile.nickname).trim();
                if (!v) return;
                await saveProfile({ ...profile, nickname: v.slice(0, 12) });
                setSaved(true);
                setTimeout(() => setSaved(false), 1500);
              }}
            >
              <input
                id="pname"
                value={nick ?? profile.nickname}
                maxLength={12}
                onChange={(e) => setNick(e.target.value)}
                className="block w-full rounded-md border-2 border-stone-700 bg-stone-900 px-3 py-2 font-pixel text-xl sm:w-56"
              />
              <button className="btn-stone px-3" aria-label="ニックネームを保存">
                {saved ? <Check size={18} aria-hidden /> : <Save size={18} aria-hidden />}
              </button>
            </form>
          ) : (
            <input
              id="pname"
              value={progress.playerName}
              maxLength={12}
              placeholder="なまえを入力"
              onChange={(e) => update((p) => ({ ...p, playerName: e.target.value }))}
              className="block w-full rounded-md border-2 border-stone-700 bg-stone-900 px-3 py-2 font-pixel text-xl sm:w-64"
            />
          )}
          {profile && (
            <p className="mt-1 text-sm text-white/60">
              {profile.className} {profile.studentNumber}番
            </p>
          )}
          <p className="mt-1 text-diamond-300">{UNLOCKABLES.find((u) => u.id === progress.equippedTitle)?.name}</p>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          {[
            ["レベル", `Lv.${level}`],
            ["EXP", progress.exp],
            ["クリア", `${cleared}/${QUESTS.length}`],
            ["マスター", `${mastered}/${QUESTS.length}`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-stone-900 px-4 py-2">
              <dt className="text-xs text-white/60">{k}</dt>
              <dd className="font-pixel text-xl text-gold-300">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="badge-h">
        <h2 id="badge-h" className="panel-title">
          <Trophy aria-hidden /> バッジ（{progress.badges.length}/{BADGES.length}）
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BADGES.map((b) => {
            const earned = progress.badges.includes(b.id);
            return (
              <div key={b.id} className={`panel flex flex-col items-center gap-2 text-center ${earned ? "" : "opacity-60"}`}>
                <BadgeIcon badge={b} earned={earned} />
                <p className="font-pixel">{earned ? b.name : "？？？"}</p>
                <p className="text-xs text-white/70">{b.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="panel" aria-labelledby="title-h">
          <h2 id="title-h" className="panel-title">
            <Award aria-hidden /> 称号
          </h2>
          <ul className="space-y-2">
            {titles.map((t) => {
              const owned = progress.titles.includes(t.id);
              const equipped = progress.equippedTitle === t.id;
              return (
                <li key={t.id}>
                  <button
                    disabled={!owned}
                    onClick={() => update((p) => ({ ...p, equippedTitle: t.id }))}
                    className={`flex min-h-[52px] w-full items-center gap-3 rounded-lg px-3 text-left ${
                      equipped ? "bg-grass-600" : "bg-stone-900 hover:bg-stone-700"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {owned ? equipped ? <Check aria-hidden /> : <span className="w-6" /> : <Lock size={20} aria-hidden />}
                    <span className="flex-1 font-pixel">{owned ? t.name : "？？？"}</span>
                    <span className="text-xs text-white/60">{t.requirement}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="panel" aria-labelledby="skin-h">
          <h2 id="skin-h" className="panel-title">
            <Shirt aria-hidden /> エージェントのスキン
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {skins.map((s) => {
              const owned = progress.skins.includes(s.id);
              const equipped = progress.equippedSkin === s.id;
              return (
                <button
                  key={s.id}
                  disabled={!owned}
                  onClick={() => update((p) => ({ ...p, equippedSkin: s.id }))}
                  className={`flex flex-col items-center gap-1 rounded-lg border-4 p-3 ${
                    equipped ? "border-gold-400 bg-stone-700" : "border-transparent bg-stone-900 hover:bg-stone-700"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                  aria-pressed={equipped}
                >
                  <span style={{ filter: owned ? undefined : "brightness(0.2)" }}>
                    <AgentAvatar skin={s.id} size={56} />
                  </span>
                  <span className="font-pixel text-sm">{owned ? s.name : "？？？"}</span>
                  <span className="text-[11px] text-white/60">{s.requirement}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {(isTeacher && mode === "cloud") || mode === "local" ? (
        <section className="panel border-stone-700/60" aria-labelledby="teacher-h">
          <h2 id="teacher-h" className="panel-title text-white/80">
            <GraduationCap aria-hidden /> 先生用
          </h2>
          {mode === "cloud" ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm">先生アカウントでログイン中：クエスト画面に模範解答が表示されます。</p>
              <Link href="/teacher" className="btn-stone">
                クラスの進捗を見る
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-white/70">ローカルモードでは模範解答が常に表示されます。</p>
              <div className="mt-4 border-t-2 border-stone-700 pt-4">
                {confirmReset ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-redstone-400">このブラウザの進捗をすべて消します。よろしいですか？</span>
                    <button className="btn-stone" onClick={() => setConfirmReset(false)}>
                      やめる
                    </button>
                    <button
                      className="btn-block bg-redstone-500 text-white"
                      onClick={() => {
                        reset();
                        setConfirmReset(false);
                      }}
                    >
                      リセット
                    </button>
                  </div>
                ) : (
                  <button className="btn-stone text-sm" onClick={() => setConfirmReset(true)}>
                    <RotateCcw size={16} aria-hidden /> 進捗をリセット
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      ) : null}
      {previewOnly && <p className="text-center text-sm text-white/60">先生プレビュー中のため、この画面の内容は保存されません。</p>}
    </div>
  );
}
