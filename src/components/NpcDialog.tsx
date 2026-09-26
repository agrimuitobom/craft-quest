"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { NpcLine } from "@/types/quest";
import { AgentAvatar } from "./AgentAvatar";

const NPC: Record<NpcLine["npc"], { name: string; color: string; face: string }> = {
  villager: { name: "村人", color: "#8b5e34", face: "🧑‍🌾" },
  blacksmith: { name: "かじ屋", color: "#3f444c", face: "🧔" },
  sage: { name: "砂漠の賢者", color: "#b8860b", face: "🧙" },
  agent: { name: "エージェント", color: "#1fb5ae", face: "" },
};

/** RPG風の会話ウィンドウ。クリック/タップで1行ずつ進む */
export function NpcDialog({ lines, skin }: { lines: NpcLine[]; skin: string }) {
  const [i, setI] = useState(0);
  const line = lines[i];
  const npc = NPC[line.npc];
  const done = i >= lines.length - 1;

  return (
    <button
      type="button"
      onClick={() => setI((v) => (done ? 0 : v + 1))}
      className="panel flex w-full items-start gap-4 text-left"
      aria-live="polite"
    >
      <span
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-4xl shadow-block"
        style={{ background: npc.color }}
        aria-hidden
      >
        {line.npc === "agent" ? <AgentAvatar skin={skin} size={48} /> : npc.face}
      </span>
      <span className="flex-1">
        <span className="font-pixel text-gold-300">{npc.name}</span>
        <span key={i} className="mt-1 block animate-pop text-base leading-relaxed sm:text-lg">
          {line.text}
        </span>
        <span className="mt-2 flex items-center justify-end gap-1 text-xs text-white/60">
          {i + 1} / {lines.length}
          {done ? " ・ もう一度読む" : <ChevronRight size={16} className="animate-bob" aria-hidden />}
        </span>
      </span>
    </button>
  );
}
