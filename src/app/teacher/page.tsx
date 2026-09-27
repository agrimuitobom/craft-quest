"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { Download, GraduationCap, NotebookPen, RefreshCw, TriangleAlert } from "lucide-react";
import { useProgress } from "@/components/ProgressProvider";
import { TeacherAnalytics } from "@/components/TeacherAnalytics";
import { getFirebase } from "@/lib/firebase";
import { QUESTS } from "@/data/quests";
import { levelFromExp } from "@/data/rewards";
import { solvedLabel, STUCK_OPTIONS, stuckLabel } from "@/data/reflection";
import { isCleared } from "@/lib/progress";
import type { QuestProgress, StudentDoc } from "@/types/quest";

interface Row extends StudentDoc {
  uid: string;
  updated: Date | null;
}

/** 先生用：クラスの進捗とつまずきの一覧 */
export default function TeacherPage() {
  const { isTeacher, mode } = useProgress();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cls, setCls] = useState("all");

  const load = useCallback(async () => {
    const fb = getFirebase();
    if (!fb) return;
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(fb.db, "users"));
      setRows(
        snap.docs.map((d) => {
          const data = d.data() as StudentDoc;
          const u = data.updatedAt;
          return { ...data, uid: d.id, updated: u instanceof Timestamp ? u.toDate() : null };
        }),
      );
    } catch (e) {
      console.error(e);
      setError("読み込めませんでした。teachers コレクションに先生のメールアドレスが登録されているか確認してください。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isTeacher && mode === "cloud") load();
  }, [isTeacher, mode, load]);

  const classes = useMemo(() => [...new Set(rows.map((r) => r.profile.className))].sort(), [rows]);
  const shown = useMemo(
    () =>
      rows
        .filter((r) => cls === "all" || r.profile.className === cls)
        .sort((a, b) => a.profile.className.localeCompare(b.profile.className, "ja") || a.profile.studentNumber - b.profile.studentNumber),
    [rows, cls],
  );

  // ふりかえり（新しい順）
  const reflections = useMemo(
    () =>
      shown
        .flatMap((r) =>
          QUESTS.flatMap((q) => {
            const rf = r.progress.quests?.[q.id]?.reflection;
            return rf ? [{ row: r, quest: q, rf }] : [];
          }),
        )
        .sort((a, b) => b.rf.at.localeCompare(a.rf.at)),
    [shown],
  );

  if (mode !== "cloud" || !isTeacher) {
    return (
      <div className="panel flex items-center gap-3">
        <TriangleAlert className="text-gold-400" aria-hidden />
        このページは先生アカウントでログインしたときだけ使えます。
      </div>
    );
  }

  const downloadCsv = () => {
    const head = ["クラス", "番号", "ニックネーム", "Googleの名前", "メール", "Lv", "EXP", "最終更新"];
    for (const q of QUESTS)
      head.push(`${q.order}_状態`, `${q.order}_ヒント段階`, `${q.order}_報告回数`, `${q.order}_つまずき`, `${q.order}_のりこえ方`, `${q.order}_ひとこと`);
    const lines = [head];
    for (const r of shown) {
      const line = [
        r.profile.className,
        String(r.profile.studentNumber),
        r.profile.nickname,
        r.googleName,
        r.email,
        String(levelFromExp(r.progress.exp).level),
        String(r.progress.exp),
        r.updated ? r.updated.toLocaleString("ja-JP") : "",
      ];
      for (const q of QUESTS) {
        const qp = r.progress.quests?.[q.id];
        const rf = qp?.reflection;
        line.push(
          statusJa(qp),
          String(qp?.hintsOpened ?? ""),
          String(qp?.attempts ?? ""),
          stuckLabel(rf?.stuck),
          solvedLabel(rf?.solved),
          rf?.note ?? "",
        );
      }
      lines.push(line);
    }
    const csv = lines.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\r\n");
    // Excel で文字化けしないよう BOM 付き UTF-8
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `craft-quest_${cls === "all" ? "全クラス" : cls}_${new Date().toLocaleDateString("sv-SE")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="flex items-center gap-2 font-pixel text-2xl">
          <GraduationCap aria-hidden /> クラスの進捗
        </h1>
        <select
          value={cls}
          onChange={(e) => setCls(e.target.value)}
          className="min-h-[44px] rounded-md border-2 border-stone-700 bg-stone-900 px-3"
          aria-label="クラス"
        >
          <option value="all">全クラス（{rows.length}人）</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}（{rows.filter((r) => r.profile.className === c).length}人）
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-2">
          <button onClick={load} className="btn-stone text-sm" disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden /> 更新
          </button>
          <button onClick={downloadCsv} className="btn-stone text-sm" disabled={!shown.length}>
            <Download size={16} aria-hidden /> CSV
          </button>
        </div>
      </header>

      {error && <p className="panel text-redstone-400">{error}</p>}

      {/* クエストごとのまとめ */}
      <section className="grid gap-3 md:grid-cols-3" aria-label="クエストごとの状況">
        {QUESTS.map((q) => {
          const qps = shown.map((r) => r.progress.quests?.[q.id]);
          const cleared = qps.filter((x) => isCleared(x?.status));
          const stuck = qps.filter((x) => x?.status === "in_progress" && (x.attempts >= 3 || x.hintsOpened >= 3));
          const avgHint = cleared.length ? cleared.reduce((s, x) => s + (x?.hintsOpened ?? 0), 0) / cleared.length : 0;
          const byHint = [0, 1, 2, 3].map((lv) => cleared.filter((x) => (x?.hintsOpened ?? 0) === lv).length);
          const rfs = qps.flatMap((x) => (x?.reflection ? [x.reflection] : []));
          const byStuck = STUCK_OPTIONS.map((o) => ({ ...o, n: rfs.filter((rf) => rf.stuck === o.id).length })).filter((o) => o.n > 0);
          return (
            <div key={q.id} className="panel">
              <p className="font-pixel">
                {q.order}. {q.title}
              </p>
              <p className="mt-2 text-3xl font-pixel text-grass-400">
                {cleared.length}
                <span className="text-base text-white/60"> / {shown.length} 人クリア</span>
              </p>
              <p className="mt-1 text-sm text-white/70">クリア者の平均ヒント段階：{avgHint.toFixed(1)}</p>
              <div className="mt-2 flex gap-1 text-xs" aria-label="クリア時に使ったヒント段階の人数">
                {byHint.map((n, lv) => (
                  <span key={lv} className="flex-1 rounded bg-stone-900 px-1 py-1 text-center">
                    {lv === 0 ? "なし" : `H${lv}`}：{n}
                  </span>
                ))}
              </div>
              {byStuck.length > 0 && (
                <div className="mt-2 text-xs" aria-label="ふりかえりで答えた、つまずいたところの人数">
                  <p className="text-white/60">つまずいたところ（ふりかえり {rfs.length} 人）</p>
                  <ul className="mt-1 flex flex-wrap gap-1">
                    {byStuck.map((o) => (
                      <li key={o.id} className="rounded bg-stone-900 px-2 py-1">
                        {o.label}：{o.n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {stuck.length > 0 && (
                <p className="mt-2 rounded bg-redstone-500/20 px-2 py-1 text-sm text-redstone-400">
                  声かけ候補 {stuck.length} 人（報告3回以上 or ヒント3まで開いて未クリア）
                </p>
              )}
            </div>
          );
        })}
      </section>

      {/* つまずき分析（学習ログ） */}
      <TeacherAnalytics students={shown} />

      {/* ふりかえり */}
      <section className="panel" aria-labelledby="reflect-list-h">
        <h2 id="reflect-list-h" className="flex items-center gap-2 font-pixel text-lg">
          <NotebookPen size={20} aria-hidden /> ふりかえり（新しい順）
        </h2>
        {reflections.length ? (
          <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
            {reflections.slice(0, 100).map(({ row, quest, rf }) => (
              <li key={`${row.uid}-${quest.id}`} className="rounded-lg bg-stone-900 px-3 py-2 text-sm">
                <p className="flex flex-wrap items-baseline gap-x-2 text-white/60">
                  <span className="text-white">
                    {row.profile.className} {row.profile.studentNumber}番 {row.profile.nickname}
                  </span>
                  <span>
                    Q{quest.order}. {quest.title}
                  </span>
                  <span className="ml-auto text-xs">{new Date(rf.at).toLocaleString("ja-JP")}</span>
                </p>
                <p className="mt-1">
                  つまずき：{stuckLabel(rf.stuck)}
                  {rf.solved && <> ／ のりこえ方：{solvedLabel(rf.solved)}</>}
                </p>
                {rf.note && <p className="mt-1 text-diamond-300">「{rf.note}」</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-white/60">まだふりかえりはありません。クリアしたときに生徒が書くと、ここに出ます。</p>
        )}
      </section>

      {/* 生徒一覧 */}
      <section className="panel overflow-x-auto p-0">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-stone-900 text-left text-white/70">
            <tr>
              <th className="px-3 py-2">クラス</th>
              <th className="px-3 py-2">番号</th>
              <th className="px-3 py-2">名前</th>
              <th className="px-3 py-2">Lv / EXP</th>
              {QUESTS.map((q) => (
                <th key={q.id} className="px-3 py-2">
                  Q{q.order}
                </th>
              ))}
              <th className="px-3 py-2">最終更新</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.uid} className="border-t border-stone-700">
                <td className="px-3 py-2">{r.profile.className}</td>
                <td className="px-3 py-2">{r.profile.studentNumber}</td>
                <td className="px-3 py-2">
                  <span className="block">{r.profile.nickname}</span>
                  <span className="block text-xs text-white/50">{r.googleName}</span>
                </td>
                <td className="px-3 py-2">
                  Lv.{levelFromExp(r.progress.exp).level} / {r.progress.exp}
                </td>
                {QUESTS.map((q) => (
                  <QuestCell key={q.id} qp={r.progress.quests?.[q.id]} />
                ))}
                <td className="px-3 py-2 text-xs text-white/60">{r.updated?.toLocaleString("ja-JP") ?? "-"}</td>
              </tr>
            ))}
            {!shown.length && !loading && (
              <tr>
                <td colSpan={5 + QUESTS.length} className="px-3 py-6 text-center text-white/60">
                  まだ生徒のデータがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <p className="text-xs text-white/50">H = 開いたヒントの段階、回 = クリア報告の回数（失敗を含む）</p>
    </div>
  );
}

function statusJa(qp?: QuestProgress) {
  if (!qp) return "未着手";
  return { locked: "未着手", available: "未着手", in_progress: "挑戦中", verifying: "挑戦中", cleared: "クリア", mastered: "マスター" }[qp.status];
}

function QuestCell({ qp }: { qp?: QuestProgress }) {
  const s = statusJa(qp);
  const color =
    s === "マスター" ? "bg-gold-400 text-stone-900" : s === "クリア" ? "bg-grass-500" : s === "挑戦中" ? "bg-diamond-500 text-stone-900" : "bg-stone-700 text-white/50";
  const warn = qp?.status === "in_progress" && (qp.attempts >= 3 || qp.hintsOpened >= 3);
  return (
    <td className="px-3 py-2">
      <span className={`inline-block rounded px-2 py-0.5 text-xs ${color} ${warn ? "ring-2 ring-redstone-400" : ""}`}>{s}</span>
      {qp && (qp.hintsOpened > 0 || qp.attempts > 0) && (
        <span className="ml-1 text-xs text-white/60">
          H{qp.hintsOpened}・{qp.attempts}回
        </span>
      )}
    </td>
  );
}
