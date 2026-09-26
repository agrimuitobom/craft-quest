"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, GraduationCap, Lock, Swords, Target } from "lucide-react";
import { getQuest, QUESTS } from "@/data/quests";
import {
  completeQuest,
  getStatus,
  isCleared,
  openHint,
  recordFailedAttempt,
  setLanguage,
  startQuest,
  type ClearReward,
} from "@/lib/progress";
import { useProgress } from "@/components/ProgressProvider";
import { NpcDialog } from "@/components/NpcDialog";
import { CodePanel } from "@/components/CodePanel";
import { HintAccordion } from "@/components/HintAccordion";
import { ReportPanel } from "@/components/ReportPanel";
import { ClearModal } from "@/components/ClearModal";
import { starsOf, STATUS_LABEL, TIER_LABEL } from "@/components/questUi";
import type { Language } from "@/types/quest";

export function QuestDetail({ id }: { id: string }) {

  const quest = getQuest(id);
  const { progress, update, hydrated, isTeacher, logEvent } = useProgress();
  const [clear, setClear] = useState<{ reward: ClearReward; expBefore: number; stars: number } | null>(null);
  const [previewLang, setPreviewLang] = useState<Language>("makecode");
  const [showSolution, setShowSolution] = useState(false);

  if (!quest) {
    return (
      <div className="panel">
        <p>クエストが見つかりません。</p>
        <Link href="/" className="btn-stone mt-3">マップへ戻る</Link>
      </div>
    );
  }
  if (!hydrated) return <div className="panel animate-pulse">読み込み中…</div>;

  const status = getStatus(progress, quest);
  const qp = progress.quests[quest.id];
  const language: Language = qp?.language ?? previewLang;
  const accepted = status === "in_progress" || isCleared(status);
  const tier = TIER_LABEL[quest.tier];

  if (status === "locked") {
    const need = quest.prerequisites.map((p) => QUESTS.find((q) => q.id === p)?.title).join("、");
    return (
      <div className="panel flex flex-col items-center gap-3 py-10 text-center">
        <Lock size={48} aria-hidden />
        <p className="font-pixel text-xl">このクエストはまだロックされています</p>
        <p className="text-white/70">「{need}」をクリアすると挑戦できるよ。</p>
        <Link href="/" className="btn-grass">マップへ戻る</Link>
      </div>
    );
  }

  const changeLang = (l: Language) => {
    setPreviewLang(l);
    update((p) => setLanguage(p, quest.id, l));
  };

  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex min-h-[44px] items-center gap-1 text-white/70 hover:text-white">
        <ArrowLeft size={18} aria-hidden /> マップへ
      </Link>

      {/* タイトル */}
      <header className="flex flex-wrap items-center gap-3">
        <span className={`rounded px-2 py-1 font-pixel text-sm ${tier.className}`}>{tier.label}</span>
        <h1 className="font-pixel text-2xl sm:text-3xl">{quest.title}</h1>
        <span className="rounded bg-stone-700 px-2 py-1 text-sm">{STATUS_LABEL[status]}</span>
        <span className="flex items-center gap-1 text-sm text-white/60">
          <Clock size={16} aria-hidden /> 約{quest.estimatedMinutes}分
        </span>
      </header>

      <NpcDialog lines={quest.story} skin={progress.equippedSkin} />

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,420px)]">
        {/* 左：ミッション内容 */}
        <div className="space-y-5">
          <section className="panel">
            <h2 className="panel-title">
              <Target aria-hidden /> ミッション
            </h2>
            <p className="text-lg leading-relaxed">{quest.objective}</p>
            <ul className="mt-3 space-y-2">
              {quest.goals.map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-sm bg-grass-400" aria-hidden />
                  {g}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg bg-stone-900 p-3 text-sm">
              <p className="font-pixel text-diamond-300">マイクラの準備</p>
              <ol className="mt-1 list-inside list-decimal space-y-1 text-white/80">
                {quest.starter.worldSetup.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
            <p className="mt-3 text-sm text-white/60">
              報酬：{quest.reward.exp} EXP（ヒントなしなら +{quest.reward.noHintBonus}）
            </p>

            {!accepted && (
              <button
                onClick={() => {
                  update((p) => startQuest(p, quest, language));
                  logEvent({ type: "start", questId: quest.id });
                }}
                className="btn-gold mt-4 w-full text-xl"
              >
                <Swords aria-hidden /> クエストを受注する
              </button>
            )}
            {isCleared(status) && (
              <p className="mt-4 rounded-lg bg-grass-600/40 p-3 text-sm">
                クリア済み（星 {starsOf(status, qp)}）。
                {status !== "mastered" && (
                  <button
                    className="ml-1 underline"
                    onClick={() => {
                      update((p) => startQuest(p, quest, language));
                      logEvent({ type: "start", questId: quest.id });
                    }}
                  >
                    ヒントなしで再挑戦する
                  </button>
                )}
              </p>
            )}
          </section>

          <CodePanel blocks={quest.starter.blocks} python={quest.starter.python} language={language} onLanguageChange={changeLang} />

          {isTeacher && (
            <section className="panel border-diamond-500">
              <h2 className="panel-title text-diamond-300">
                <GraduationCap aria-hidden /> 先生用：模範解答
              </h2>
              <button className="btn-stone" onClick={() => setShowSolution((v) => !v)}>
                {showSolution ? "かくす" : "表示する"}
              </button>
              {showSolution && (
                <>
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-stone-900 p-4 text-sm text-diamond-300">
                    <code>{quest.solution.python}</code>
                  </pre>
                  <p className="mt-2 text-sm text-white/80">{quest.solution.blocksNote}</p>
                </>
              )}
            </section>
          )}
        </div>

        {/* 右：ヒント & 報告 */}
        <div className="space-y-5">
          <HintAccordion
            hints={quest.hints}
            openedLevel={qp?.hintsOpened ?? 0}
            disabled={!accepted}
            onOpen={(lv) => {
              update((p) => openHint(p, quest.id, lv));
              logEvent({ type: "hint", questId: quest.id, hintLevel: lv });
            }}
          />
          {accepted ? (
            <ReportPanel
              key={quest.id}
              quest={quest}
              initialCode={qp?.lastCode}
              onFail={(code) => {
                update((p) => recordFailedAttempt(p, quest.id, code));
                logEvent({ type: "fail", questId: quest.id, attempt: (qp?.attempts ?? 0) + 1 });
              }}
              onPass={(code) => {
                const { next, reward } = completeQuest(progress, quest, code);
                logEvent({
                  type: "clear",
                  questId: quest.id,
                  attempt: next.quests[quest.id].attempts,
                  hintLevel: qp?.hintsOpened ?? 0,
                  exp: reward.totalExp,
                });
                update(() => next);
                setClear({ reward, expBefore: progress.exp, stars: starsOf(next.quests[quest.id].status, next.quests[quest.id]) });
              }}
            />
          ) : (
            <div className="panel text-sm text-white/70">クエストを受注すると、ここからクリア報告ができるよ。</div>
          )}
        </div>
      </div>

      {clear && (
        <ClearModal
          reward={clear.reward}
          expBefore={clear.expBefore}
          stars={clear.stars}
          skin={progress.equippedSkin}
          onClose={() => setClear(null)}
        />
      )}
    </div>
  );
}
