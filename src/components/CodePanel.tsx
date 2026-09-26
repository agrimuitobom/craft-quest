"use client";

import { useState } from "react";
import { Blocks, Check, Copy, FileCode2 } from "lucide-react";
import type { BlockNode, Language } from "@/types/quest";

// MakeCode for Minecraft のカテゴリ色に近づけた配色
const CAT_COLOR: Record<BlockNode["category"], string> = {
  player: "#0078d7",
  agent: "#d83b01",
  loops: "#107c10",
  logic: "#5c2d91",
  variables: "#b4009e",
  blocks: "#7abb55",
  functions: "#3455db",
  positions: "#69b090",
};

function BlockView({ node }: { node: BlockNode }) {
  const color = CAT_COLOR[node.category];
  const hasBody = !!node.children?.length;
  return (
    <div className="my-1">
      <div
        className="inline-block rounded-md px-3 py-2 text-sm font-bold text-white shadow-block"
        style={{ background: color, outline: node.blank ? "3px dashed #f5b700" : undefined, outlineOffset: 2 }}
      >
        {node.label}
        {node.blank && <span className="ml-2 rounded bg-white/25 px-1 text-xs">考えよう</span>}
      </div>
      {hasBody && (
        <div className="ml-3 border-l-[10px] pl-2" style={{ borderColor: color }}>
          {node.children!.map((c, i) => (
            <BlockView key={i} node={c} />
          ))}
        </div>
      )}
      {node.elseChildren && (
        <>
          <div className="ml-0 inline-block rounded-md px-3 py-1 text-sm font-bold text-white" style={{ background: color }}>
            でなければ
          </div>
          <div className="ml-3 border-l-[10px] pl-2" style={{ borderColor: color }}>
            {node.elseChildren.map((c, i) => (
              <BlockView key={i} node={c} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function CodePanel({
  blocks,
  python,
  language,
  onLanguageChange,
  title = "コードのひな形",
}: {
  blocks: BlockNode[];
  python: string;
  language: Language;
  onLanguageChange: (l: Language) => void;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(python);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <section className="panel">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="panel-title mb-0">{title}</h2>
        <div className="ml-auto flex rounded-lg bg-stone-900 p-1" role="tablist" aria-label="言語">
          {(
            [
              { id: "makecode", label: "ブロック", Icon: Blocks },
              { id: "python", label: "Python", Icon: FileCode2 },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={language === id}
              onClick={() => onLanguageChange(id)}
              className={`flex min-h-[40px] items-center gap-1 rounded-md px-3 font-pixel text-sm ${
                language === id ? "bg-grass-500 text-white" : "text-white/70 hover:bg-stone-700"
              }`}
            >
              <Icon size={16} aria-hidden /> {label}
            </button>
          ))}
        </div>
      </div>

      {language === "makecode" ? (
        <div className="overflow-x-auto rounded-lg bg-[#e8ecef] p-3 text-stone-900">
          {blocks.map((b, i) => (
            <div key={i} className={i > 0 ? "mt-4" : ""}>
              <BlockView node={b} />
            </div>
          ))}
          <p className="mt-3 text-xs text-stone-700">点線のブロックは、自分で考えて埋めるところだよ。</p>
        </div>
      ) : (
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-stone-900 p-4 text-sm leading-relaxed text-diamond-300">
            <code>{python}</code>
          </pre>
          <button onClick={copy} className="btn-stone absolute right-2 top-2 min-h-[36px] px-3 text-sm" aria-label="コードをコピー">
            {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            {copied ? "コピーした" : "コピー"}
          </button>
        </div>
      )}
    </section>
  );
}
