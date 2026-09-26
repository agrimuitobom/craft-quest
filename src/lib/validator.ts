import type { Quest, ValidationRule } from "@/types/quest";

export interface RuleResult {
  ok: boolean;
  message: string;
}

export interface VerifyResult {
  passed: boolean;
  codeResults: RuleResult[];
  observationsOk: boolean;
}

/** Python のコメント(#以降)を除去して、コメント内のキーワードでの誤判定を防ぐ */
function stripComments(code: string) {
  return code
    .split("\n")
    .map((line) => {
      let inStr: string | null = null;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (inStr) {
          if (c === inStr && line[i - 1] !== "\\") inStr = null;
        } else if (c === '"' || c === "'") inStr = c;
        else if (c === "#") return line.slice(0, i);
      }
      return line;
    })
    .join("\n");
}

function count(code: string, pattern: string, flags = "") {
  const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
  return (code.match(re) ?? []).length;
}

function checkRule(code: string, rule: ValidationRule): RuleResult {
  const n = count(code, rule.pattern, rule.flags);
  switch (rule.type) {
    case "contains":
      return { ok: n > 0, message: rule.message };
    case "notContains":
      return { ok: n === 0, message: rule.message };
    case "minCount":
      return { ok: n >= rule.min, message: rule.message };
    case "maxCount":
      return { ok: n <= rule.max, message: rule.message };
  }
}

export function verifyQuest(quest: Quest, rawCode: string, checkedObservations: boolean[]): VerifyResult {
  const code = stripComments(rawCode);
  const codeResults: RuleResult[] = [];

  if (!code.trim()) {
    codeResults.push({ ok: false, message: "コードが貼り付けられていないよ" });
  } else {
    if (/_{3,}/.test(code)) codeResults.push({ ok: false, message: "空欄「____」がまだ残っているよ" });
    for (const rule of quest.validation.codeRules) codeResults.push(checkRule(code, rule));
  }

  const observationsOk =
    checkedObservations.length === quest.validation.observations.length && checkedObservations.every(Boolean);

  return {
    passed: codeResults.every((r) => r.ok) && observationsOk,
    codeResults,
    observationsOk,
  };
}
