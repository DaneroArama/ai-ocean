/**
 * Role Affinity scoring — hidden, shuffled, confidence aware
 * New Feature §8 (hidden +3/+2), §10 (top3 + %), §12 (confidence), §13 (I'm not sure)
 */

export type ScoringSignal = { optionId: string; roleId: string; weight: number };
export type RoleAffinity = { roleId: string; raw: number; affinity: number };

export function calculateRoleAffinity(
  answers: { questionId: string; optionIds: string[]; isNotSure: boolean }[],
  questions: { _id: string; scoringSignals: ScoringSignal[] }[],
  roleIds: string[]
): Map<string, number> {
  const raw = new Map<string, number>(roleIds.map((id) => [id, 0]));
  const qMap = new Map(questions.map((q) => [q._id, q]));
  for (const ans of answers) {
    if (ans.isNotSure) continue;
    const q = qMap.get(ans.questionId);
    if (!q) continue;
    for (const oid of ans.optionIds) {
      for (const sig of q.scoringSignals.filter((s) => s.optionId === oid)) {
        raw.set(sig.roleId, (raw.get(sig.roleId) ?? 0) + sig.weight);
      }
    }
  }
  return raw;
}

export function rankRoles(raw: Map<string, number>, explanations: Map<string, { en: string; my: string }>): { roleId: string; affinity: number; explanationEn: string; explanationMy: string }[] {
  const max = Math.max(1, ...raw.values());
  const ranked = [...raw.entries()].map(([roleId, score]) => ({
    roleId, affinity: Math.round((score / max) * 100),
    explanationEn: explanations.get(roleId)?.en ?? "You showed affinity for this role.",
    explanationMy: explanations.get(roleId)?.my ?? "ဤအခန်းကဏ္ဍနှင့် ကိုက်ညီမှုရှိပါသည်။",
  })).sort((a, b) => b.affinity - a.affinity);
  return ranked.slice(0, 3);
}

export function calculateConfidence(answers: { isNotSure: boolean; responseMs?: number }[], ranked: RoleAffinity[]): { level: "high" | "moderate" | "low"; score: number } {
  const notSureRate = answers.filter((a) => a.isNotSure).length / Math.max(1, answers.length);
  const spread = ranked.length >= 2 ? ranked[0].affinity - ranked[1].affinity : 0;
  let score = 75 - notSureRate * 40 + Math.min(20, spread);
  // light timing signal: very fast (<800ms) slightly lower
  const fast = answers.filter((a) => a.responseMs !== undefined && a.responseMs < 800).length / Math.max(1, answers.length);
  score -= fast * 10;
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const level = clamped >= 75 ? "high" : clamped >= 50 ? "moderate" : "low";
  return { level, score: clamped };
}
