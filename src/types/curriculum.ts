/**
 * Public curriculum content types. Everything in this file describes content
 * that ships with the app (or is seeded into the public curriculum tables);
 * nothing here is user-specific.
 */

/** A Java feature release number, e.g. 8, 11, 17, 21, 25. */
export type JavaVersion = number;

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/** Separate mastery measures tracked for every learner. */
export type MasteryDimension =
  | 'conceptual'
  | 'coding'
  | 'debugging'
  | 'runtime'
  | 'interview'
  | 'retention';

export type ModuleLevel = 'core' | 'advanced' | 'optional';

export interface VersionNote {
  feature: string;
  since: JavaVersion;
  /** e.g. "preview in 19-20, final in 21" */
  note?: string;
}

export interface CodeExample {
  id: string;
  title: string;
  /** Complete source. When `runnable` it must compile as Main.java. */
  code: string;
  runnable?: boolean;
  /** Exact stdout produced by the program; verified by scripts/verify-java-content.mjs. */
  expectedOutput?: string;
  /** Standard input fed to the program during verification and when run in the playground. */
  stdin?: string;
  minJavaVersion?: JavaVersion;
  explanation?: string;
}

export interface WalkthroughStep {
  /** 1-based line number(s) in the referenced example. */
  lines?: [number, number];
  text: string;
}

export interface Walkthrough {
  exampleId: string;
  steps: WalkthroughStep[];
}

export interface ChoiceOption {
  id: string;
  text: string;
}

interface CheckBase {
  id: string;
  prompt: string;
  explanation: string;
  dimension: MasteryDimension;
  hints?: string[];
}

export interface McqCheck extends CheckBase {
  kind: 'mcq';
  code?: string;
  options: ChoiceOption[];
  correctOptionId: string;
}

export interface MultiSelectCheck extends CheckBase {
  kind: 'multi-select';
  code?: string;
  options: ChoiceOption[];
  correctOptionIds: string[];
}

/**
 * Predict-the-output question. `code` must be a runnable Main.java and the
 * correct option's text must equal its real stdout (verified by script).
 */
export interface PredictOutputCheck extends CheckBase {
  kind: 'predict-output';
  code: string;
  options: ChoiceOption[];
  correctOptionId: string;
  /** Set when the correct answer is a compile error rather than output. */
  expectCompileError?: boolean;
}

export type KnowledgeCheck = McqCheck | MultiSelectCheck | PredictOutputCheck;

export interface CommonMistake {
  mistake: string;
  why: string;
  fix: string;
  code?: string;
}

export interface RevisionPrompt {
  id: string;
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Concept page: the five sections every lesson presents first.
// ---------------------------------------------------------------------------

export type DiagramTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

/** A box on a diagram grid. Columns and rows are 0-based; `span` widens a node across columns. */
export interface DiagramNode {
  id: string;
  label: string;
  /** Second, smaller line(s) under the label. */
  detail?: string;
  col: number;
  row: number;
  span?: number;
  tone?: DiagramTone;
  shape?: 'box' | 'pill' | 'cylinder' | 'note';
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  /** Draw arrowheads at both ends. */
  both?: boolean;
}

/** A labelled boundary drawn behind a block of cells, e.g. "JVM process" or "Heap". */
export interface DiagramGroup {
  label: string;
  fromCol: number;
  toCol: number;
  fromRow: number;
  toRow: number;
  tone?: DiagramTone;
}

/**
 * Diagrams are data rendered as SVG on every platform:
 * - `concept`: an illustration of the idea (what it looks like)
 * - `flow`: steps or decisions over time
 * - `architecture`: components, boundaries and how they connect
 */
export interface Diagram {
  id: string;
  kind: 'concept' | 'flow' | 'architecture';
  title: string;
  /** One or two sentences explaining what to notice. */
  caption: string;
  /**
   * "How to read this diagram": 3-7 steps walking through the boxes and arrows in
   * order, naming each box in **bold** and explaining what happens there and why.
   */
  explanation?: string[];
  cols: number;
  rows: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups?: DiagramGroup[];
}

export interface Mnemonic {
  /** The memorable device itself, e.g. "PIE-A" or a short image. */
  device: string;
  /** What each letter/part stands for. */
  expansion: { key: string; meaning: string }[];
  /** Optional mental picture that ties it together. */
  visual?: string;
}

export interface BreakdownItem {
  kind: 'analogy' | 'insight' | 'real-world' | 'angle';
  title: string;
  body: string;
}

/** "Types of X" — e.g. the kinds of inheritance and how Java supports each. */
export interface VariantGroup {
  title: string;
  intro?: string;
  items: {
    name: string;
    summary: string;
    support?: 'supported' | 'partial' | 'not-supported';
    note?: string;
    code?: string;
  }[];
}

export interface DeepDiveItem {
  title: string;
  body: string;
  /** Public, authoritative references (JLS, JVMS, JEPs, official docs, well-known books). */
  sources?: { label: string; url?: string }[];
}

/**
 * The short, tutorial-style explanation shown first on every concept page: one plain
 * definition, a few points, and a small example with its output (like a W3Schools page).
 */
export interface QuickDefinition {
  /** 1-2 short sentences that start with what the thing is, e.g. "A loop runs the same code again and again". */
  definition: string;
  /** 3-6 short sentences: how it works, or the rules to remember. */
  points: string[];
  example: {
    /** Short label, e.g. "Your first program". */
    title: string;
    /** Java code. When `runnable`, a complete program with `public class Main` that is run on a real JDK. */
    code: string;
    /** What the program prints. Required, and verified by scripts/verify-java-content.mjs, when `runnable`. */
    output?: string;
    runnable: boolean;
    /** 1-3 sentences explaining the example line by line, in plain words. */
    explain: string;
  };
  /** One short "Tip" or "Note" (common mistake, rule of thumb). */
  tip?: string;
}

/** The formal definition a textbook or specification gives, with its key terms. */
export interface TextbookDefinition {
  /** Precise, formal definition (40-130 words). */
  definition: string;
  /** 2-6 technical terms used in the definition, each defined precisely. */
  terms: { term: string; meaning: string }[];
  /** Where the wording follows an authoritative source, e.g. "JLS §8.1". */
  source?: string;
}

export interface LessonConcepts {
  /** Short, tutorial-style definition with an example, shown first. */
  quick?: QuickDefinition;
  /** Formal, textbook-level definition with the key terms defined. */
  textbook?: TextbookDefinition;
  /** Crisp interview-ready definition (2-4 sentences). */
  interviewDefinition: string;
  /** Short follow-up questions interviewers ask next, with model answers. */
  interviewFollowUps?: { question: string; answer: string }[];
  mnemonic: Mnemonic;
  breakdown: BreakdownItem[];
  diagrams: Diagram[];
  variants?: VariantGroup[];
  deepDive: DeepDiveItem[];
}

// ---------------------------------------------------------------------------
// "Make it stick": plain-English memory aids built on how memory works.
// ---------------------------------------------------------------------------

/** Names of the drawn pictograms available to illustrations (see src/components/pictograms). */
export type PictogramName =
  | 'person' | 'people' | 'chef' | 'robot' | 'teacher'
  | 'house' | 'factory' | 'shop' | 'bank' | 'library' | 'kitchen'
  | 'box' | 'gift' | 'boxes' | 'shelf' | 'drawer' | 'bucket' | 'trash' | 'recycle'
  | 'key' | 'lock' | 'door' | 'shield' | 'fence' | 'id-card'
  | 'book' | 'recipe' | 'blueprint' | 'note' | 'envelope' | 'mailbox' | 'stamp' | 'tag' | 'label'
  | 'truck' | 'conveyor' | 'road' | 'traffic-light' | 'signpost' | 'map' | 'ladder' | 'bridge'
  | 'plates' | 'queue' | 'tree' | 'family' | 'puzzle' | 'gear' | 'gears' | 'magnifier' | 'mirror'
  | 'clock' | 'calendar' | 'hourglass' | 'stopwatch' | 'coin' | 'calculator' | 'scale'
  | 'phone' | 'laptop' | 'server' | 'database' | 'cloud' | 'globe' | 'plug' | 'battery'
  | 'brain' | 'bulb' | 'warning' | 'check' | 'cross' | 'question' | 'star' | 'heart' | 'flag'
  | 'chain' | 'magnet' | 'camera' | 'copy' | 'scissors' | 'pipe' | 'tap' | 'filter' | 'funnel'
  | 'thread' | 'baton' | 'whistle' | 'crown' | 'medal' | 'rocket' | 'snail' | 'bug' | 'wrench' | 'hammer';

/** One drawn element in an illustration, placed on a 100 x 60 canvas by its centre. */
export interface IllustrationItem {
  icon: PictogramName;
  /** Short caption under the icon (<= 18 characters). */
  label: string;
  x: number;
  y: number;
  /** Relative size, default 1 (range 0.6-1.6). */
  size?: number;
  tone?: DiagramTone;
}

/** A picture-story scene that sits next to the flow diagram. */
export interface Illustration {
  title: string;
  caption: string;
  items: IllustrationItem[];
  /** Optional arrows between items (by index). */
  arrows?: { from: number; to: number; label?: string; dashed?: boolean }[];
}

export interface MemoryAid {
  /** The whole idea in one simple sentence a 12-year-old understands (<= 24 words). */
  oneLiner: string;
  /** A short everyday story (40-130 words) in which the concept naturally appears. */
  story: string;
  /** Exactly three key points (chunking): the minimum to remember. */
  keyPoints: [string, string, string];
  /**
   * The concept's types or subcategories in simple words (required when the concept
   * page has "types of" sections). 1-3 groups of 2-9 types, each with an everyday example.
   */
  types?: { title: string; items: { name: string; simple: string }[] }[];
  /** What people mix it up with, and the one difference that matters. */
  confusion?: { mixedUpWith: string; difference: string };
  /** A tiny action to do within a minute (doing it yourself makes it stick). */
  tryIt?: string;
  /** Retrieval practice: questions to answer from memory before revealing (2-3). */
  recall: { question: string; answer: string }[];
  /** The picture shown beside the flow diagram. */
  picture: Illustration;
}

export interface Lesson {
  id: string;
  /** Plain-English memory aids ("Make it stick"), attached from src/content/memory. */
  memory?: MemoryAid;
  /** Interview definition, mnemonic, breakdown, diagrams and deep dive (attached from src/content/concepts). */
  concepts?: LessonConcepts;
  moduleId: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  difficulty: Difficulty;
  prerequisites: string[];
  versionNotes?: VersionNote[];
  objectives: string[];
  plainEnglish: string;
  technical: string;
  whyItExists: string;
  whenToUse: string[];
  whenNotToUse: string[];
  examples: CodeExample[];
  walkthrough: Walkthrough;
  realWorld: { title: string; scenario: string };
  commonMistakes: CommonMistake[];
  checks: KnowledgeCheck[];
  challengeIds: string[];
  masteryCriteria: string[];
  relatedLessonIds: string[];
  revision: RevisionPrompt[];
}

export interface CurriculumModule {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  summary: string;
  level: ModuleLevel;
  prerequisites: string[];
  lessons: Lesson[];
  /** Topics that are on the roadmap but not yet written. Shown honestly as "planned". */
  plannedTopics?: string[];
  bossChallengeId?: string;
}

export interface ChallengeTest {
  id: string;
  name: string;
  stdin: string;
  expectedStdout: string;
  hidden?: boolean;
}

export interface StaticCheck {
  id: string;
  description: string;
  /** JavaScript RegExp source evaluated against the learner's code. */
  pattern: string;
  mustMatch: boolean;
}

export interface CodingChallenge {
  id: string;
  title: string;
  moduleId: string;
  lessonId?: string;
  difficulty: Difficulty;
  kind: 'coding' | 'debugging' | 'boss';
  dimension: 'coding' | 'debugging';
  description: string;
  starterCode: string;
  solution: string;
  solutionExplanation: string;
  complexity: { time: string; space: string; notes?: string };
  hints: string[];
  tests: ChallengeTest[];
  staticChecks?: StaticCheck[];
  concepts: string[];
}
