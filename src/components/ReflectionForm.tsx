"use client";

import { useState } from "react";
import { Check, NotebookPen } from "lucide-react";
import { SOLVED_OPTIONS, STUCK_OPTIONS } from "@/data/reflection";
import { REFLECTION_NOTE_MAX } from "@/lib/progress";
import type { Reflection, SolvedBy, StuckPoint } from "@/types/quest";

/** クリア時のふりかえり（任意）。えらぶだけで答えられるようにして、ひとことは自由に */
export function ReflectionForm({ onSave }: { onSave: (r: Omit<Reflection, "at">) => void }) {
  const [stuck, setStuck] = useState<StuckPoint | null>(null);
  const [solved, setSolved] = useState<SolvedBy | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const needSolved = stuck !== null && stuck !== "none";
  const ready = stuck !== null && (!needSolved || solved !== null);

  if (saved) {
    return (
      <p className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-grass-600/30 py-2 text-sm text-grass-400" role="status">
        <Check size={18} aria-hidden /> ふりかえりをきろくしたよ。つぎのクエストでも思い出そう！
      </p>
    );
  }

  return (
    <section className="mt-5 rounded-lg bg-stone-900 p-3 text-left" aria-labelledby="reflect-h">
      <h3 id="reflect-h" className="flex items-center gap-2 font-pixel text-diamond-300">
        <NotebookPen size={18} aria-hidden /> ふりかえり
      </h3>

      <fieldset className="mt-2">
        <legend className="text-sm">① どこでつまずいた？</legend>
        <Chips options={STUCK_OPTIONS} value={stuck} onChange={(v) => { setStuck(v); if (v === "none") setSolved(null); }} />
      </fieldset>

      {needSolved && (
        <fieldset className="mt-3">
          <legend className="text-sm">② どうやってのりこえた？</legend>
          <Chips options={SOLVED_OPTIONS} value={solved} onChange={setSolved} />
        </fieldset>
      )}

      <label className="mt-3 block text-sm">
        {needSolved ? "③" : "②"} つぎに使えそうなこと（書かなくてもOK）
        <input
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, REFLECTION_NOTE_MAX))}
          maxLength={REFLECTION_NOTE_MAX}
          placeholder="れい：字下げに気をつける"
          className="mt-1 w-full rounded-md border-2 border-stone-700 bg-stone-800 px-3 py-2 text-base"
        />
      </label>

      <button
        onClick={() => {
          if (!stuck) return;
          onSave({ stuck, ...(needSolved && solved ? { solved } : {}), ...(note.trim() ? { note: note.trim() } : {}) });
          setSaved(true);
        }}
        disabled={!ready}
        className="btn-grass mt-3 w-full disabled:opacity-50"
      >
        <Check size={18} aria-hidden /> きろくする
      </button>
    </section>
  );
}

function Chips<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T | null; onChange: (v: T) => void }) {
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`min-h-[44px] rounded-full border-2 px-3 text-sm transition ${
            value === o.id ? "border-diamond-300 bg-diamond-400 text-stone-900" : "border-stone-600 bg-stone-800 hover:border-diamond-400"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
