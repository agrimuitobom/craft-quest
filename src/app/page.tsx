"use client";

import Link from "next/link";
import { ArrowRight, Gamepad2, ScrollText, Send } from "lucide-react";
import { QUESTS } from "@/data/quests";
import { getStatus } from "@/lib/progress";
import { useProgress } from "@/components/ProgressProvider";
import { WorldMap } from "@/components/WorldMap";
import { QuestCard } from "@/components/QuestCard";
import { AgentAvatar } from "@/components/AgentAvatar";

export default function DashboardPage() {
  const { progress, hydrated } = useProgress();

  // 「つづきから」：挑戦中 → 受注可能 の順で最初のクエスト
  const next =
    QUESTS.find((q) => getStatus(progress, q) === "in_progress") ?? QUESTS.find((q) => getStatus(progress, q) === "available");
  const clearedCount = QUESTS.filter((q) => ["cleared", "mastered"].includes(getStatus(progress, q))).length;

  return (
    <div className="space-y-6">
      {/* ナビゲーター NPC */}
      <section className="panel flex flex-col gap-4 sm:flex-row sm:items-center">
        <AgentAvatar skin={progress.equippedSkin} size={64} bob />
        <div className="flex-1">
          <p className="font-pixel text-lg text-gold-300">エージェント</p>
          <p className="mt-1 leading-relaxed">
            {!hydrated
              ? "…"
              : next
                ? progress.quests[next.id]?.status === "in_progress"
                  ? `「${next.title}」のつづきをやろう！ マイクラで動かしたら、ここに報告してね。`
                  : `つぎは「${next.title}」だよ。いっしょに行こう！`
                : "すべてのクエストをクリアしたね！ 星3つ（ヒントなし）をねらってみよう。"}
          </p>
          <p className="mt-1 text-sm text-white/60">
            クリア {clearedCount} / {QUESTS.length}
          </p>
        </div>
        {next && (
          <Link href={`/quest/${next.id}`} className="btn-gold self-stretch sm:self-auto">
            {progress.quests[next.id]?.status === "in_progress" ? "つづきから" : "クエストへ"} <ArrowRight size={20} aria-hidden />
          </Link>
        )}
      </section>

      <section aria-labelledby="map-h">
        <h2 id="map-h" className="panel-title">
          ワールドマップ
        </h2>
        <WorldMap />
      </section>

      {/* あそびかた：コンパニオンアプリの3ステップ */}
      <section className="grid gap-3 sm:grid-cols-3" aria-label="あそびかた">
        {[
          { Icon: ScrollText, t: "1. 受注する", d: "クエストを読んで、目標とヒントを確認" },
          { Icon: Gamepad2, t: "2. マイクラで実行", d: "Code Builder でプログラムを作って動かす" },
          { Icon: Send, t: "3. 報告する", d: "コードを貼り付けて結果をチェック → クリア！" },
        ].map(({ Icon, t, d }) => (
          <div key={t} className="panel flex items-start gap-3">
            <Icon className="mt-0.5 shrink-0 text-grass-400" aria-hidden />
            <div>
              <p className="font-pixel">{t}</p>
              <p className="text-sm text-white/70">{d}</p>
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="list-h">
        <h2 id="list-h" className="panel-title">
          クエスト一覧
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {QUESTS.map((q) => (
            <QuestCard key={q.id} quest={q} />
          ))}
        </div>
      </section>
    </div>
  );
}
