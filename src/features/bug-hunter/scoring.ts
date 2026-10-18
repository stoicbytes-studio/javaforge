import type { BugHunt, Incident } from '@/types/practice';

/**
 * Bug hunt score: locating the defect 30%, root cause 40%, fix 30%.
 * Line selection earns partial credit by overlap (Jaccard) so selecting the
 * whole file does not score.
 */
export function scoreBugHunt(hunt: BugHunt, selectedLines: number[], rootCauseId: string, fixId: string) {
  const want = new Set(hunt.buggyLines);
  const got = new Set(selectedLines);
  const intersection = [...got].filter((l) => want.has(l)).length;
  const union = new Set([...want, ...got]).size;
  const location = union === 0 ? 0 : intersection / union;
  const cause = rootCauseId === hunt.correctRootCauseId ? 1 : 0;
  const fix = fixId === hunt.correctFixId ? 1 : 0;
  return {
    location,
    cause,
    fix,
    score: 0.3 * location + 0.4 * cause + 0.3 * fix,
  };
}

/**
 * Incident score: correct hypothesis 45%, correct fix 35%, investigation
 * efficiency 20%. Efficiency rewards using the time budget well and choosing
 * useful diagnostics instead of trying everything.
 */
export function scoreIncident(incident: Incident, actionIds: string[], hypothesisId: string, fixId: string) {
  const taken = incident.actions.filter((a) => actionIds.includes(a.id));
  const minutes = taken.reduce((s, a) => s + a.costMinutes, 0);
  const useful = taken.filter((a) => a.useful).length;
  const precision = taken.length === 0 ? 0 : useful / taken.length;
  const withinBudget = minutes <= incident.timeBudgetMinutes ? 1 : Math.max(0, 1 - (minutes - incident.timeBudgetMinutes) / incident.timeBudgetMinutes);
  const efficiency = 0.5 * precision + 0.5 * withinBudget;
  const hypothesisCorrect = hypothesisId === incident.correctHypothesisId;
  const fixCorrect = incident.fixes.find((f) => f.id === fixId)?.correct ?? false;
  return {
    minutes,
    efficiency,
    hypothesisCorrect,
    fixCorrect,
    score: 0.45 * (hypothesisCorrect ? 1 : 0) + 0.35 * (fixCorrect ? 1 : 0) + 0.2 * efficiency,
  };
}
