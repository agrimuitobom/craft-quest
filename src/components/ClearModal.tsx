"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, Map, RotateCcw, Star } from "lucide-react";
import type { ClearReward } from "@/lib/progress";
import type { Reflection } from "@/types/quest";
import { BADGES, levelFromExp, UNLOCKABLES } from "@/data/rewards";
import { BadgeIcon } from "./BadgeIcon";
import { AgentAvatar } from "./AgentAvatar";
import { ReflectionForm } from "./ReflectionForm";

/** クリア演出：EXPカウントアップ → バー伸長 → レベルアップ → バッジ/解放 の順に表示 */
export function ClearModal({
  reward,
  expBefore,
  stars,
  skin,
  onClose,
  onReflect,
}: {
  reward: ClearReward;
  expBefore: number;
  stars: number;
  skin: string;
  onClose: () => void;
  onReflect: (r: Omit<Reflection, "at">) => void;
}) {
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState<0 | 1 | 2>(0); // 0:カウント中 1:レベル表示 2:報酬表示
  const dialogRef = useRef<HTMLDivElement>(null);

  // EXP カウントアップ（requestAnimationFrame）
  useEffect(() => {
    const total = reward.totalExp;
    if (total === 0) {
      setPhase(2);
      return;
    }
    const dur = 1200;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setShown(Math.round(total * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
      else {
        setPhase(1);
        setTimeout(() => setPhase(2), 700);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reward.totalExp]);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const lv = levelFromExp(expBefore + shown);
  const levelUp = reward.levelAfter > reward.levelBefore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="clear-h">
      <div ref={dialogRef} tabIndex={-1} className="relative my-auto max-h-full w-full max-w-md animate-pop overflow-y-auto rounded-2xl border-4 border-gold-400 bg-stone-800 p-6 text-center outline-none">
        {/* 浮かび上がる +EXP パーティクル */}
        {reward.totalExp > 0 && phase === 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-24" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="absolute animate-floatUp font-pixel text-grass-400"
                style={{ left: `${15 + i * 17}%`, animationDelay: `${i * 0.18}s` }}
              >
                +EXP
              </span>
            ))}
          </div>
        )}

        <p id="clear-h" className="font-pixel text-3xl text-gold-300 drop-shadow">
          {reward.firstClear ? "QUEST CLEAR!" : reward.mastered ? "MASTERED!" : "もう一度クリア！"}
        </p>

        <div className="mt-3 flex justify-center gap-1" aria-label={`星 ${stars} つ`}>
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              size={40}
              className={`${n <= stars ? "fill-gold-400 text-gold-400" : "text-white/25"} animate-pop`}
              style={{ animationDelay: `${0.2 + n * 0.15}s` }}
              aria-hidden
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <AgentAvatar skin={skin} size={56} bob />
          <div className="text-left">
            <p className="font-pixel text-4xl tabular-nums text-grass-400">+{shown}</p>
            <p className="text-xs text-white/70">
              基本 {reward.baseExp} ＋ ヒントなしボーナス {reward.bonusExp}
            </p>
          </div>
        </div>

        {/* EXP バー */}
        <div className="mt-4">
          <div className="flex justify-between font-pixel text-sm">
            <span>Lv.{lv.level}</span>
            <span className="text-white/60">
              {expBefore + shown} / {lv.next}
            </span>
          </div>
          <div className="mt-1 h-4 overflow-hidden rounded bg-stone-700">
            <div className="h-full bg-grass-400" style={{ width: `${lv.ratio * 100}%` }} />
          </div>
        </div>

        {levelUp && phase >= 1 && (
          <p className="mt-4 flex animate-pop items-center justify-center gap-2 rounded-lg bg-gold-400 py-2 font-pixel text-xl text-stone-900">
            <ArrowUp aria-hidden /> レベルアップ！ Lv.{reward.levelAfter}
          </p>
        )}

        {phase === 2 && (reward.newBadges.length > 0 || reward.newUnlocks.length > 0) && (
          <div className="mt-4 animate-pop space-y-3 text-left">
            {reward.newBadges.map((id) => {
              const b = BADGES.find((x) => x.id === id)!;
              return (
                <div key={id} className="flex items-center gap-3 rounded-lg bg-stone-900 p-2">
                  <BadgeIcon badge={b} size={18} />
                  <div>
                    <p className="font-pixel text-gold-300">バッジ獲得：{b.name}</p>
                    <p className="text-xs text-white/70">{b.description}</p>
                  </div>
                </div>
              );
            })}
            {reward.newUnlocks.map((u) => {
              const item = UNLOCKABLES.find((x) => x.id === u.id)!;
              return (
                <div key={u.id} className="flex items-center gap-3 rounded-lg bg-stone-900 p-2">
                  {u.type === "skin" ? (
                    <AgentAvatar skin={u.id} size={36} />
                  ) : (
                    <span className="rounded bg-diamond-400 px-2 py-1 font-pixel text-xs text-stone-900">称号</span>
                  )}
                  <p className="font-pixel text-diamond-300">
                    {u.type === "skin" ? "スキン" : "称号"}「{item.name}」が解放された！
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {!reward.mastered && phase === 2 && (
          <p className="mt-4 text-sm text-white/70">ヒントなしで再挑戦すると、星3つ＆ボーナスEXPがもらえるよ！</p>
        )}

        {phase === 2 && <ReflectionForm onSave={onReflect} />}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button onClick={onClose} className="btn-stone flex-1">
            <RotateCcw size={18} aria-hidden /> とじる
          </button>
          <Link href="/" className="btn-grass flex-1">
            <Map size={18} aria-hidden /> マップへ
          </Link>
        </div>
      </div>
    </div>
  );
}
