"use client";

import Link from "next/link";
import { Check, Crown, Lock, Star, Swords } from "lucide-react";
import { QUESTS, TEASERS } from "@/data/quests";
import { getStatus } from "@/lib/progress";
import { useProgress } from "./ProgressProvider";
import { starsOf, STATUS_LABEL } from "./questUi";
import type { QuestStatus } from "@/types/quest";

const NODE_STYLE: Record<QuestStatus, string> = {
  locked: "bg-stone-700 text-white/50",
  available: "bg-gold-400 text-stone-900 ring-4 ring-gold-300/60",
  in_progress: "bg-diamond-400 text-stone-900 ring-4 ring-diamond-300/60",
  verifying: "bg-diamond-400 text-stone-900",
  cleared: "bg-grass-500 text-white",
  mastered: "bg-gold-500 text-stone-900",
};

// 道のつながり：番号（order）の順につなぐ
const PATHS: string[][] = [[...QUESTS].sort((a, b) => a.order - b.order).map((q) => q.id)];

const posOf = (id: string) => QUESTS.find((q) => q.id === id)?.mapPos ?? TEASERS.find((t) => t.id === id)?.mapPos;

export function WorldMap() {
  const { progress } = useProgress();

  return (
    <div
      className="relative aspect-[3/5] w-full overflow-hidden rounded-xl border-4 border-stone-700 sm:aspect-[16/10]"
    >
      {/* エリア背景 */}
      <div className="absolute inset-0 bg-grass-600" />
      <div className="absolute left-0 top-0 h-[44%] w-[30%] rounded-br-[45%] bg-grass-700" aria-hidden />
      <div className="absolute left-[30%] top-0 h-[62%] w-[45%] rounded-b-[40%] bg-[#e4c77a]" aria-hidden />
      <div className="absolute bottom-0 right-0 h-[70%] w-[32%] rounded-tl-[35%] bg-stone-700" aria-hidden />
      <div className="absolute right-[4%] top-[6%] h-[24%] w-[22%] rounded-xl bg-dirt-500/70" aria-hidden />
      <AreaLabel x={30} y={94} text="はじまりの草原" />
      <AreaLabel x={3} y={5} text="まよいの森" />
      <AreaLabel x={44} y={6} text="灼熱の砂漠" />
      <AreaLabel x={72} y={92} text="地下迷宮" />
      <AreaLabel x={78} y={4} text="クラフト村" />

      {/* 道 */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {PATHS.map((ids, i) => (
          <polyline
            key={i}
            points={ids.map((id) => `${posOf(id)!.x},${posOf(id)!.y}`).join(" ")}
            fill="none"
            stroke="#fff"
            strokeOpacity={0.55}
            strokeWidth={4}
            strokeDasharray="2 10"
            strokeLinecap="square"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* 今後のクエスト（？） */}
      {TEASERS.map((t) => (
        <div
          key={t.id}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: `${t.mapPos.x}%`, top: `${t.mapPos.y}%` }}
          title={`近日公開：${t.title}`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-800/80 font-pixel text-xl text-white/40 shadow-block sm:h-12 sm:w-12">
            ?
          </span>
        </div>
      ))}

      {/* クエストノード */}
      {QUESTS.map((q) => {
        const status = getStatus(progress, q);
        const stars = starsOf(status, progress.quests[q.id]);
        const locked = status === "locked";
        const Inner = (
          <>
            {status === "available" && (
              <span className="absolute -top-7 animate-bob font-pixel text-2xl text-gold-300 drop-shadow" aria-hidden>
                !
              </span>
            )}
            <span
              className={`relative flex h-12 w-12 items-center justify-center rounded-md font-pixel text-2xl shadow-block sm:h-16 sm:w-16 ${NODE_STYLE[status]}`}
            >
              {locked ? <Lock aria-hidden /> : status === "mastered" ? <Crown aria-hidden /> : status === "cleared" ? <Check strokeWidth={3} aria-hidden /> : status === "in_progress" ? <Swords aria-hidden /> : q.order}
              {status !== "available" && (
                <span className="absolute -left-2 -top-2 rounded bg-stone-900 px-1 font-sans text-[11px] leading-4 text-white" aria-hidden>
                  {q.order}
                </span>
              )}
            </span>
            {stars > 0 && (
              <span className="mt-1 flex gap-0.5" aria-label={`星 ${stars} つ`}>
                {[1, 2, 3].map((n) => (
                  <Star key={n} size={14} className={n <= stars ? "fill-gold-400 text-gold-400" : "text-white/40"} aria-hidden />
                ))}
              </span>
            )}
            <span
              className={`mt-1 w-max max-w-[8rem] rounded bg-stone-900/80 px-2 py-0.5 text-center text-[11px] leading-tight sm:block sm:max-w-[10rem] sm:text-xs ${
                status === "available" || status === "in_progress" ? "block" : "hidden"
              }`}
            >
              {q.title}
            </span>
          </>
        );
        const cls = "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center";
        const style = { left: `${q.mapPos.x}%`, top: `${q.mapPos.y}%` };
        return locked ? (
          <div key={q.id} className={cls} style={style} aria-label={`${q.title}（${STATUS_LABEL[status]}）`}>
            {Inner}
          </div>
        ) : (
          <Link
            key={q.id}
            href={`/quest/${q.id}`}
            className={`${cls} transition hover:scale-105`}
            style={style}
            aria-label={`${q.title}（${STATUS_LABEL[status]}）`}
          >
            {Inner}
          </Link>
        );
      })}
    </div>
  );
}

function AreaLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <span
      className="absolute -translate-y-1/2 font-pixel text-[11px] text-white/80 drop-shadow sm:text-sm"
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-hidden
    >
      {text}
    </span>
  );
}
