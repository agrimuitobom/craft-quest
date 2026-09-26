"use client";

import { useState } from "react";
import { CircleCheck, CircleX, Send } from "lucide-react";
import type { Quest } from "@/types/quest";
import { verifyQuest, type VerifyResult } from "@/lib/validator";

/**
 * クリア報告パネル
 * ① ゲーム内で確認できたことをチェック（観察の自己申告）
 * ② MakeCode の Python タブからコードをコピーして貼り付け（静的チェック）
 */
export function ReportPanel({
  quest,
  initialCode,
  onPass,
  onFail,
}: {
  quest: Quest;
  initialCode?: string;
  onPass: (code: string) => void;
  onFail: (code: string) => void;
}) {
  const [code, setCode] = useState(initialCode ?? "");
  const [checks, setChecks] = useState<boolean[]>(() => quest.validation.observations.map(() => false));
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const submit = () => {
    const r = verifyQuest(quest, code, checks);
    setResult(r);
    if (r.passed) onPass(code);
    else {
      setShakeKey((k) => k + 1);
      onFail(code);
    }
  };

  return (
    <section className="panel" aria-labelledby="report-h">
      <h2 id="report-h" className="panel-title">
        <Send aria-hidden /> クリア報告
      </h2>

      <fieldset>
        <legend className="font-pixel">① マイクラで確認できたことにチェック</legend>
        <div className="mt-2 space-y-2">
          {quest.validation.observations.map((o, i) => (
            <label key={i} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg bg-stone-900 px-3">
              <input
                type="checkbox"
                className="h-6 w-6 accent-[#5aa832]"
                checked={checks[i]}
                onChange={(e) => setChecks((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
              />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <label htmlFor="code-input" className="font-pixel">
          ② 作ったコードを貼り付け
        </label>
        <p className="text-xs text-white/60">ブロックで作った人は、MakeCode 上の「Python」に切り替えてコピーしてね。</p>
        <textarea
          id="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          rows={10}
          placeholder="ここに Ctrl+V（コマンド+V）で貼り付け"
          className="mt-2 w-full rounded-lg border-2 border-stone-700 bg-stone-900 p-3 font-mono text-sm text-diamond-300 placeholder:text-white/30"
        />
      </div>

      <button onClick={submit} className="btn-grass mt-3 w-full text-xl">
        報告する！
      </button>

      {result && !result.passed && (
        <div key={shakeKey} className="mt-4 animate-shake rounded-lg border-2 border-redstone-400 bg-stone-900 p-3" role="alert">
          <p className="font-pixel text-redstone-400">おしい！ チェックしてみよう</p>
          <ul className="mt-2 space-y-1 text-sm">
            {!result.observationsOk && (
              <li className="flex items-start gap-2">
                <CircleX size={18} className="mt-0.5 shrink-0 text-redstone-400" aria-hidden />
                マイクラで確認する項目が、まだ全部チェックされていないよ
              </li>
            )}
            {result.codeResults.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                {r.ok ? (
                  <CircleCheck size={18} className="mt-0.5 shrink-0 text-grass-400" aria-hidden />
                ) : (
                  <CircleX size={18} className="mt-0.5 shrink-0 text-redstone-400" aria-hidden />
                )}
                <span className={r.ok ? "text-white/50 line-through" : ""}>{r.message}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-white/60">こまったら「デバッグ道場」のヒントを1つずつ開いてみよう。</p>
        </div>
      )}
    </section>
  );
}
