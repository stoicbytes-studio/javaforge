import type { ChoiceOption, Difficulty } from './curriculum';

// ---------------------------------------------------------------------------
// Interview Arena
// ---------------------------------------------------------------------------

export type InterviewQuestionKind =
  | 'conceptual'
  | 'internals'
  | 'output'
  | 'debugging'
  | 'coding'
  | 'scenario';

export interface RubricPoint {
  id: string;
  /** What a good answer covers, phrased for the feedback list. */
  label: string;
  weight: number;
  /** Case-insensitive RegExp sources; the point is covered if any matches. */
  matchers: string[];
  /** Advice shown when the point is missing. */
  tip: string;
}

export interface Misconception {
  id: string;
  /** Case-insensitive RegExp source that detects the inaccurate claim. */
  pattern: string;
  correction: string;
}

export interface InterviewQuestion {
  id: string;
  moduleId: string;
  lessonIds: string[];
  kind: InterviewQuestionKind;
  difficulty: Difficulty;
  prompt: string;
  code?: string;
  /** Written-answer questions (conceptual, internals, scenario). */
  rubric?: RubricPoint[];
  misconceptions?: Misconception[];
  /** Choice questions (output, debugging). */
  options?: ChoiceOption[];
  correctOptionId?: string;
  explanation?: string;
  /** Coding questions link to a playground challenge. */
  challengeId?: string;
  modelAnswer: string;
  followUps: string[];
}

// ---------------------------------------------------------------------------
// Bug Hunter
// ---------------------------------------------------------------------------

export interface BugHunt {
  id: string;
  title: string;
  moduleId: string;
  difficulty: Difficulty;
  category: string;
  symptom: string;
  code: string;
  evidence?: string;
  /** 1-based line numbers that contain the defect. */
  buggyLines: number[];
  rootCauseOptions: ChoiceOption[];
  correctRootCauseId: string;
  fixOptions: (ChoiceOption & { code?: string })[];
  correctFixId: string;
  explanation: string;
  prevention: string[];
  hints: string[];
}

// ---------------------------------------------------------------------------
// Production incidents
// ---------------------------------------------------------------------------

export interface MetricSeries {
  label: string;
  unit: string;
  points: number[];
  threshold?: number;
}

export interface EvidenceItem {
  id: string;
  kind: 'log' | 'metric' | 'code' | 'thread-dump' | 'text';
  title: string;
  content?: string;
  series?: MetricSeries;
}

export interface DiagnosticAction {
  id: string;
  label: string;
  costMinutes: number;
  useful: boolean;
  feedback: string;
  reveals: EvidenceItem[];
}

export interface Incident {
  id: string;
  title: string;
  severity: 'SEV1' | 'SEV2' | 'SEV3';
  service: string;
  difficulty: Difficulty;
  alert: string;
  context: string;
  timeBudgetMinutes: number;
  initialEvidence: EvidenceItem[];
  actions: DiagnosticAction[];
  hypotheses: ChoiceOption[];
  correctHypothesisId: string;
  rootCause: string;
  fixes: { id: string; text: string; correct: boolean; feedback: string }[];
  prevention: string[];
  relatedModuleIds: string[];
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  tests: string[];
}

export interface Project {
  id: string;
  title: string;
  difficulty: Difficulty;
  summary: string;
  skills: string[];
  moduleIds: string[];
  requirements: string[];
  milestones: ProjectMilestone[];
  edgeCases: string[];
  tradeOffs: { decision: string; guidance: string }[];
  stretchGoals: string[];
}

// ---------------------------------------------------------------------------
// JVM Visualization Lab
// ---------------------------------------------------------------------------

export interface JvmValue {
  name: string;
  value: string;
  /** Heap object id when this slot holds a reference. */
  ref?: string;
}

export interface JvmFrame {
  method: string;
  line?: number;
  locals: JvmValue[];
  operandStack?: string[];
}

export interface JvmThread {
  name: string;
  state: 'NEW' | 'RUNNABLE' | 'BLOCKED' | 'WAITING' | 'TIMED_WAITING' | 'TERMINATED';
  frames: JvmFrame[];
  holdsLock?: string;
  waitingFor?: string;
}

export interface JvmHeapObject {
  id: string;
  type: string;
  fields: JvmValue[];
  generation?: 'young' | 'old';
  /** Used by GC scenarios: undefined = not yet evaluated. */
  reachable?: boolean;
  collected?: boolean;
  inStringPool?: boolean;
  note?: string;
}

export interface JvmClassEntry {
  name: string;
  status: 'loading' | 'loaded' | 'linked' | 'initialized';
  loader: 'bootstrap' | 'platform' | 'application';
  staticFields?: JvmValue[];
}

export type JvmPhase = 'compile' | 'load' | 'link' | 'initialize' | 'execute' | 'gc' | 'threads';

export interface JvmStep {
  phase: JvmPhase;
  title: string;
  explanation: string;
  line?: number;
  threads: JvmThread[];
  heap: JvmHeapObject[];
  classes: JvmClassEntry[];
  bytecode?: { text: string; active?: boolean }[];
  output?: string;
}

export interface JvmScenario {
  id: string;
  title: string;
  summary: string;
  concepts: string[];
  relatedLessonIds: string[];
  source: string;
  steps: JvmStep[];
}
