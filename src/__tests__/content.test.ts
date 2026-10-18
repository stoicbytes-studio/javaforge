import {
  BUG_HUNTS,
  CATALOG,
  CHALLENGES,
  getChallenge,
  getLesson,
  getModule,
  INCIDENTS,
  INTERVIEW_QUESTIONS,
  JVM_SCENARIOS,
  LESSONS,
  MODULES,
  PROJECTS,
} from '@/content';
import { TIERS } from '@/features/gamification/tiers';
import { parseBlocks } from '@/components/Markdown';

/** Structural integrity of the curriculum. Java correctness is checked by `npm run verify:java`. */
describe('curriculum integrity', () => {
  it('has all 17 domains in order with unique ids', () => {
    expect(MODULES).toHaveLength(17);
    expect(MODULES.map((m) => m.order)).toEqual(Array.from({ length: 17 }, (_, i) => i + 1));
    expect(new Set(MODULES.map((m) => m.id)).size).toBe(17);
  });

  it('never ships empty placeholder lessons: modules are written or explicitly planned', () => {
    for (const m of MODULES) {
      if (m.lessons.length === 0) expect(m.plannedTopics?.length).toBeGreaterThan(0);
    }
  });

  it('uses globally unique ids for lessons, checks, challenges and questions', () => {
    const ids = [
      ...LESSONS.map((l) => `lesson:${l.id}`),
      ...CATALOG.map((c) => `${c.itemType}:${c.itemId}`),
      ...BUG_HUNTS.map((b) => `bug:${b.id}`),
      ...PROJECTS.map((p) => `project:${p.id}`),
      ...JVM_SCENARIOS.map((s) => `jvm:${s.id}`),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references only existing modules, lessons and challenges', () => {
    for (const m of MODULES) {
      for (const p of m.prerequisites) expect(getModule(p)).toBeDefined();
      if (m.bossChallengeId) expect(getChallenge(m.bossChallengeId)?.kind).toBe('boss');
    }
    for (const l of LESSONS) {
      for (const p of l.prerequisites) expect(getLesson(p)).toBeDefined();
      for (const c of l.challengeIds) expect(getChallenge(c)).toBeDefined();
      expect(l.examples.some((e) => e.id === l.walkthrough.exampleId)).toBe(true);
    }
    for (const c of CHALLENGES) {
      expect(getModule(c.moduleId)).toBeDefined();
      if (c.lessonId) expect(getLesson(c.lessonId)).toBeDefined();
    }
    for (const q of INTERVIEW_QUESTIONS) {
      expect(getModule(q.moduleId)).toBeDefined();
      for (const id of q.lessonIds) expect(getLesson(id)).toBeDefined();
      if (q.challengeId) expect(getChallenge(q.challengeId)).toBeDefined();
    }
    for (const b of BUG_HUNTS) expect(getModule(b.moduleId)).toBeDefined();
    for (const i of INCIDENTS) for (const id of i.relatedModuleIds) expect(getModule(id)).toBeDefined();
    for (const p of PROJECTS) for (const id of p.moduleIds) expect(getModule(id)).toBeDefined();
    for (const s of JVM_SCENARIOS) for (const id of s.relatedLessonIds) expect(getLesson(id)).toBeDefined();
  });

  it('gives every written lesson the full set of teaching sections', () => {
    for (const l of LESSONS) {
      expect(l.objectives.length).toBeGreaterThan(0);
      expect(l.plainEnglish.length).toBeGreaterThan(100);
      expect(l.technical.length).toBeGreaterThan(200);
      expect(l.whyItExists.length).toBeGreaterThan(50);
      expect(l.whenToUse.length).toBeGreaterThan(0);
      expect(l.whenNotToUse.length).toBeGreaterThan(0);
      expect(l.examples.length).toBeGreaterThan(0);
      expect(l.walkthrough.steps.length).toBeGreaterThan(1);
      expect(l.commonMistakes.length).toBeGreaterThan(1);
      expect(l.checks.length).toBeGreaterThanOrEqual(3);
      expect(l.masteryCriteria.length).toBeGreaterThan(0);
      expect(l.revision.length).toBeGreaterThan(0);
    }
  });

  it('has interview rubric matchers and misconception patterns that are valid regular expressions', () => {
    for (const q of INTERVIEW_QUESTIONS) {
      for (const p of q.rubric ?? []) for (const m of p.matchers) expect(() => new RegExp(m, 'i')).not.toThrow();
      for (const m of q.misconceptions ?? []) expect(() => new RegExp(m.pattern, 'i')).not.toThrow();
      const answerable = (q.rubric?.length ?? 0) > 0 || (!!q.options && !!q.correctOptionId) || !!q.challengeId;
      expect(answerable).toBe(true);
    }
  });

  it('keeps bug hunt line numbers and answers consistent', () => {
    for (const b of BUG_HUNTS) {
      const lines = b.code.split('\n').length;
      for (const n of b.buggyLines) expect(n).toBeLessThanOrEqual(lines);
      expect(b.rootCauseOptions.some((o) => o.id === b.correctRootCauseId)).toBe(true);
      expect(b.fixOptions.some((o) => o.id === b.correctFixId)).toBe(true);
    }
    for (const i of INCIDENTS) {
      expect(i.hypotheses.some((h) => h.id === i.correctHypothesisId)).toBe(true);
      expect(i.fixes.filter((f) => f.correct)).toHaveLength(1);
      expect(i.actions.some((a) => a.useful)).toBe(true);
    }
  });

  it('keeps JVM scenario steps within the source', () => {
    for (const s of JVM_SCENARIOS) {
      const lines = s.source.split('\n').length;
      for (const step of s.steps) if (step.line) expect(step.line).toBeLessThanOrEqual(lines);
    }
  });

  it('only gates tiers on modules that exist', () => {
    for (const t of TIERS) {
      for (const r of t.requirements) if (r.kind === 'module') expect(getModule(r.moduleId)).toBeDefined();
    }
  });

  it('closes every fenced code block in lesson prose', () => {
    for (const l of LESSONS) {
      for (const text of [l.plainEnglish, l.technical, l.whyItExists, l.realWorld.scenario]) {
        expect((text.match(/```/g) ?? []).length % 2).toBe(0);
        expect(() => parseBlocks(text)).not.toThrow();
      }
    }
  });
});
