"use client";

import { useState } from "react";
import { ChevronDown, Eye, Lightbulb, Lock, Search, Wrench } from "lucide-react";
import type { Hint } from "@/types/quest";

const KIND = {
  observe: { label: "観察", Icon: Eye },
  focus: { label: "焦点", Icon: Search },
  partial: { label: "部分", Icon: Wrench },
} as const;

/**
 * デバッグ道場：3段階ヒント
 * - 前の段階を開くまで次は開けない（いきなり答えに飛ばない）
 * - 開く前に1回確認をはさみ、「自分で考える」選択肢を残す
 * - 開いた段階は progress に記録（星・ボーナスEXPに反映）
 */
export function HintAccordion({
  hints,
  openedLevel,
  onOpen,
  disabled,
}: {
  hints: Hint[];
  openedLevel: number;
  onOpen: (level: number) => void;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useState<number | null>(openedLevel || null);
  const [confirming, setConfirming] = useState<number | null>(null);

  return (
    <section className="panel" aria-labelledby="dojo-h">
      <h2 id="dojo-h" className="panel-title">
        <Lightbulb aria-hidden /> デバッグ道場
      </h2>

      <div className="mb-3 rounded-lg bg-stone-900 p-3 text-sm leading-relaxed text-white/80">
        <p className="font-pixel text-white">ヒントの前に、自分に聞いてみよう</p>
        <ul className="mt-1 list-inside list-disc">
          <li>エラーのメッセージは出ている？ 何行目？</li>
          <li>エージェントは「どこで」「どっちを向いて」止まった？</li>
          <li>思っていた動きと、実際の動きのちがいは？</li>
        </ul>
      </div>

      <ol className="space-y-2">
        {hints.map((h) => {
          const unlocked = h.level <= openedLevel;
          const canOpen = !disabled && h.level === openedLevel + 1;
          const isOpen = expanded === h.level && unlocked;
          const { label, Icon } = KIND[h.kind];

          return (
            <li key={h.level} className="overflow-hidden rounded-lg border-2 border-stone-700">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`hint-${h.level}`}
                disabled={!unlocked && !canOpen}
                onClick={() => {
                  if (unlocked) setExpanded(isOpen ? null : h.level);
                  else if (canOpen) setConfirming(h.level);
                }}
                className="flex min-h-[52px] w-full items-center gap-3 bg-stone-700/60 px-4 text-left disabled:opacity-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded bg-gold-400 font-pixel text-stone-900">{h.level}</span>
                <Icon size={18} aria-hidden className="text-gold-300" />
                <span className="flex-1 font-pixel">
                  {unlocked ? h.title : `ヒント${h.level}（${label}）`}
                </span>
                {unlocked ? (
                  <ChevronDown aria-hidden className={`transition ${isOpen ? "rotate-180" : ""}`} />
                ) : (
                  <Lock size={18} aria-hidden />
                )}
              </button>

              {confirming === h.level && !unlocked && (
                <div className="flex flex-wrap items-center gap-2 bg-stone-900 p-3 text-sm">
                  <span className="flex-1">
                    ヒントを見ると「ヒントなしボーナス」はなくなるよ。もう少し自分で考える？
                  </span>
                  <button className="btn-stone min-h-[40px] text-sm" onClick={() => setConfirming(null)}>
                    考える
                  </button>
                  <button
                    className="btn-gold min-h-[40px] text-sm"
                    onClick={() => {
                      onOpen(h.level);
                      setConfirming(null);
                      setExpanded(h.level);
                    }}
                  >
                    ヒントを見る
                  </button>
                </div>
              )}

              {isOpen && (
                <div id={`hint-${h.level}`} className="animate-pop bg-stone-900 p-4 leading-relaxed">
                  <p>{h.body}</p>
                  {h.snippet && (
                    <pre className="mt-3 overflow-x-auto rounded bg-black/40 p-3 text-sm text-diamond-300">
                      <code>{h.snippet}</code>
                    </pre>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {disabled && <p className="mt-2 text-xs text-white/60">クエストを受注するとヒントが使えるよ。</p>}
    </section>
  );
}
