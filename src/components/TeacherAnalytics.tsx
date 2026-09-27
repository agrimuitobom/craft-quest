"use client";

import { useMemo, useState } from "react";
import { collectionGroup, getDocs, Timestamp } from "firebase/firestore";
import { Activity, RefreshCw, TriangleAlert } from "lucide-react";
import { getFirebase } from "@/lib/firebase";
import { analyze, formatMinutes, type LogEvent } from "@/lib/analytics";
import { QUESTS } from "@/data/quests";
import type { LearningEventType, StudentProfile } from "@/types/quest";

/** 先生用：学習ログ（events）からのつまずき分析。読み込みはボタンを押したときだけ（読み取り回数を節約） */
export function TeacherAnalytics({ students }: { students: { uid: string; profile: StudentProfile }[] }) {
  const [events, setEvents] = useState<LogEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const fb = getFirebase();
    if (!fb) return;
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collectionGroup(fb.db, "events"));
      setEvents(
        snap.docs.flatMap((d) => {
          const x = d.data() as { type: LearningEventType; questId: string; hintLevel?: number; at?: unknown };
          const uid = d.ref.parent.parent?.id;
          if (!uid || !(x.at instanceof Timestamp)) return [];
          return [{ uid, type: x.type, questId: x.questId, hintLevel: x.hintLevel, at: x.at.toMillis() }];
        }),
      );
    } catch (e) {
      console.error(e);
      setError("学習ログを読み込めませんでした。ルールを公開したか（npm run deploy:rules）確認してください。");
    } finally {
      setLoading(false);
    }
  };

  const byUid = useMemo(() => new Map(students.map((s) => [s.uid, s.profile])), [students]);
  const result = useMemo(() => {
    if (!events) return null;
    const mine = events.filter((e) => byUid.has(e.uid)); // 選んでいるクラスの生徒だけ
    return { count: mine.length, ...analyze(mine, QUESTS.map((q) => q.id)) };
  }, [events, byUid]);

  const maxMinutes = Math.max(1, ...(result?.quests.map((q) => q.clearMinutes ?? 0) ?? [0]));
  // 止まっている人（受注してまだクリアしていない）がいちばん多いクエスト。同じならクリアまでの時間が長いほう
  const hardest = result?.quests
    .filter((q) => q.started > q.cleared)
    .sort((a, b) => b.started - b.cleared - (a.started - a.cleared) || (b.clearMinutes ?? 0) - (a.clearMinutes ?? 0))[0]?.questId;
  const rows = result?.quests.filter((q) => q.started > 0) ?? [];

  return (
    <section className="panel space-y-4" aria-labelledby="analytics-h">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="analytics-h" className="flex items-center gap-2 font-pixel text-lg">
          <Activity size={20} aria-hidden /> つまずき分析（学習ログ）
        </h2>
        <button onClick={load} className="btn-stone ml-auto text-sm" disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden />
          {events ? "読み込みなおす" : "学習ログを読み込む"}
        </button>
      </div>

      {error && <p className="text-redstone-400">{error}</p>}
      {!result && !error && (
        <p className="text-sm text-white/60">
          「学習ログを読み込む」を押すと、クエストごとのクリアまでの時間や、いま止まっている生徒がわかります。（ログの件数だけ Firestore の読み取りが発生します）
        </p>
      )}

      {result && (
        <>
          <p className="text-xs text-white/50">
            ログ {result.count} 件。時間は「最初に受注してから」の経過で、日をまたぐと長くなるため中央値で表示しています。
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-stone-900 text-left text-white/70">
                <tr>
                  <th className="px-3 py-2">クエスト</th>
                  <th className="px-3 py-2">挑戦 → クリア</th>
                  <th className="px-3 py-2">クリアまでの時間（中央値）</th>
                  <th className="px-3 py-2">失敗報告（平均）</th>
                  <th className="px-3 py-2">ヒントを使った人</th>
                  <th className="px-3 py-2">ヒント 1 / 2 / 3 を開くまで</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const q = QUESTS.find((x) => x.id === s.questId)!;
                  const hard = s.questId === hardest;
                  return (
                    <tr key={s.questId} className={`border-t border-stone-700 ${hard ? "bg-redstone-500/10" : ""}`}>
                      <td className="px-3 py-2">
                        {q.order}. {q.title}
                        {hard && <span className="ml-2 rounded bg-redstone-500 px-1.5 py-0.5 text-xs text-white">止まっている人がいちばん多い</span>}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {s.started} → {s.cleared} 人
                        {s.started > s.cleared && <span className="ml-1 text-redstone-400">（{s.started - s.cleared} 人とちゅう）</span>}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="w-20 tabular-nums">{formatMinutes(s.clearMinutes)}</span>
                          {s.clearMinutes != null && (
                            <span className="h-2 rounded bg-gold-400" style={{ width: `${(s.clearMinutes / maxMinutes) * 120}px` }} aria-hidden />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 tabular-nums">{s.failsBeforeClear == null ? "-" : `${s.failsBeforeClear.toFixed(1)} 回`}</td>
                      <td className="px-3 py-2 tabular-nums">{s.hintRate == null ? "-" : `${Math.round(s.hintRate * 100)}%`}</td>
                      <td className="px-3 py-2 tabular-nums text-white/80">{s.hintMinutes.map((m) => formatMinutes(m)).join(" / ")}</td>
                    </tr>
                  );
                })}
                {!rows.length && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-white/60">
                      まだ学習ログがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {rows.length > 0 && rows.length < QUESTS.length && (
            <p className="text-xs text-white/50">まだだれも受注していないクエストは省いています。</p>
          )}

          <div>
            <h3 className="font-pixel">いま止まっている生徒（受注してまだクリアしていない）</h3>
            {result.stuck.length ? (
              <ul className="mt-2 max-h-96 space-y-2 overflow-y-auto pr-1">
                {result.stuck.slice(0, 100).map((s) => {
                  const p = byUid.get(s.uid)!;
                  const q = QUESTS.find((x) => x.id === s.questId);
                  return (
                    <li
                      key={`${s.uid}-${s.questId}`}
                      className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg px-3 py-2 text-sm ${s.alert ? "bg-redstone-500/20" : "bg-stone-900"}`}
                    >
                      {s.alert && <TriangleAlert size={16} className="self-center text-redstone-400" aria-label="声かけ候補" />}
                      <span>
                        {p.className} {p.studentNumber}番 {p.nickname}
                      </span>
                      <span className="text-white/70">
                        Q{q?.order}. {q?.title}
                      </span>
                      <span className="tabular-nums">取り組み {formatMinutes(s.workedMinutes)}</span>
                      <span className="tabular-nums">失敗 {s.fails} 回</span>
                      <span className="tabular-nums">ヒント {s.hintLevel}</span>
                      <span className="ml-auto text-xs text-white/50">最後の操作 {new Date(s.lastAt).toLocaleString("ja-JP")}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-white/60">止まっている生徒はいません。</p>
            )}
            <p className="mt-2 text-xs text-white/50">
              <TriangleAlert size={12} className="inline text-redstone-400" aria-hidden /> ＝ 声かけ候補（失敗 3 回以上・ヒント 3 まで開いた・そのクエストのクリア時間の中央値の 2 倍以上かかっている）
            </p>
          </div>
        </>
      )}
    </section>
  );
}
