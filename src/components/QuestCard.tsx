"use client";

import Link from "next/link";
import { Clock, Lock, Star } from "lucide-react";
import type { Quest } from "@/types/quest";
import { getStatus } from "@/lib/progress";
import { QUESTS } from "@/data/quests";
import { useProgress } from "./ProgressProvider";
import { starsOf, STATUS_LABEL, TIER_LABEL } from "./questUi";

const CONCEPT_JA: Record<string, string> = {
  sequence: "順次",
  loop: "くりかえし",
  "nested-loop": "二重ループ",
  variable: "変数",
  condition: "条件分岐",
  function: "関数",
  event: "イベント",
  algorithm: "アルゴリズム",
};

export function QuestCard({ quest }: { quest: Quest }) {
  const { progress } = useProgress();
  const status = getStatus(progress, quest);
  const locked = status === "locked";
  const stars = starsOf(status, progress.quests[quest.id]);
  const tier = TIER_LABEL[quest.tier];
  const need = quest.prerequisites.map((id) => QUESTS.find((q) => q.id === id)?.title).join("、");

  const body = (
    <div className={`panel h-full transition ${locked ? "opacity-60" : "hover:border-grass-500"}`}>
      <div className="flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 font-pixel text-xs ${tier.className}`}>{tier.label}</span>
        <span className="text-xs text-white/60">{STATUS_LABEL[status]}</span>
        {stars > 0 && (
          <span className="ml-auto flex" aria-label={`星 ${stars} つ`}>
            {[1, 2, 3].map((n) => (
              <Star key={n} size={16} className={n <= stars ? "fill-gold-400 text-gold-400" : "text-white/30"} aria-hidden />
            ))}
          </span>
        )}
      </div>
      <h3 className="mt-2 font-pixel text-lg leading-snug">
        {quest.order}. {quest.title}
      </h3>
      <p className="mt-1 text-sm text-white/75">{quest.objective}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {quest.concepts.map((c) => (
          <span key={c} className="rounded bg-stone-700 px-2 py-0.5 text-xs">
            {CONCEPT_JA[c]}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-white/60">
        <span className="flex items-center gap-1">
          <Clock size={14} aria-hidden /> 約{quest.estimatedMinutes}分
        </span>
        <span>+{quest.reward.exp} EXP</span>
        {locked && (
          <span className="ml-auto flex items-center gap-1 text-white/70">
            <Lock size={14} aria-hidden /> 「{need}」をクリアで解放
          </span>
        )}
      </div>
    </div>
  );

  return locked ? body : <Link href={`/quest/${quest.id}`} className="block h-full">{body}</Link>;
}
