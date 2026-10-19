import {
  BUG_HUNTS,
  CHALLENGES,
  INCIDENTS,
  INTERVIEW_QUESTIONS,
  JVM_SCENARIOS,
  MODULES,
  PROJECTS,
} from '@/content';
import { JAVA_FEATURES } from '@/content/versions/javaReleases';
import type { CurriculumModule, Lesson } from '@/types/curriculum';

/**
 * Client-side full-text search over everything the app teaches. The index is
 * built once from the bundled content, so search works offline and instantly.
 */

export type SearchKind = 'lesson' | 'topic' | 'module' | 'challenge' | 'interview' | 'bug-hunt' | 'incident' | 'project' | 'jvm' | 'java-feature';

export interface SearchDoc {
  id: string;
  kind: SearchKind;
  title: string;
  /** Where it lives, e.g. "OOP · Types of inheritance". */
  context: string;
  href: string;
  /** Short, high-signal text: summaries, definitions, names. */
  keywords: string;
  /** Long text for full-text matches (lower weight). */
  body: string;
}

export interface SearchResult {
  doc: SearchDoc;
  score: number;
  snippet?: string;
}

export const KIND_LABEL: Record<SearchKind, string> = {
  lesson: 'Lesson',
  topic: 'Topic',
  module: 'Module',
  challenge: 'Challenge',
  interview: 'Interview',
  'bug-hunt': 'Bug hunt',
  incident: 'Incident',
  project: 'Project',
  jvm: 'JVM Lab',
  'java-feature': 'Java version',
};

/** Common abbreviations and synonyms learners type. Each query token also matches its expansions. */
const SYNONYMS: Record<string, string[]> = {
  oop: ['object', 'oriented', 'class', 'inheritance'],
  gc: ['garbage', 'collection', 'collector'],
  di: ['dependency', 'injection'],
  ioc: ['inversion', 'control'],
  dp: ['dynamic', 'programming'],
  jit: ['just', 'compiler'],
  jmm: ['memory', 'model'],
  npe: ['nullpointerexception', 'null'],
  oom: ['outofmemoryerror', 'memory'],
  dsa: ['data', 'structures', 'algorithms'],
  bst: ['binary', 'search', 'tree'],
  jpa: ['persistence', 'hibernate', 'entity'],
  api: ['rest', 'http', 'interface'],
  regex: ['regular', 'expression', 'pattern'],
  regexp: ['regular', 'expression', 'pattern'],
  lambda: ['lambdas', 'functional'],
  thread: ['threads', 'concurrency'],
  async: ['asynchronous', 'completablefuture'],
  vt: ['virtual', 'threads'],
  ci: ['continuous', 'integration'],
  tdd: ['test', 'driven'],
  string: ['strings'],
  exception: ['exceptions', 'throw'],
  collection: ['collections'],
  generic: ['generics'],
  interface: ['interfaces'],
  stream: ['streams'],
};

export const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[`*_>#]/g, ' ')
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const tokens = (s: string) => normalise(s).split(/[\s.\-]+/).filter((t) => t.length > 0);

function levenshteinWithin1(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

const plain = (s: string) => s.replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim();

function lessonDocs(m: CurriculumModule, l: Lesson): SearchDoc[] {
  const href = `/learn/${m.id}/${l.id}`;
  const c = l.concepts;
  const docs: SearchDoc[] = [
    {
      id: `lesson:${l.id}`,
      kind: 'lesson',
      title: l.title,
      context: `${m.shortTitle} · ${l.difficulty} · ${l.estimatedMinutes} min`,
      href,
      keywords: [
        l.summary,
        ...l.objectives,
        c?.interviewDefinition ?? '',
        c?.mnemonic.device ?? '',
        ...(c?.breakdown.map((b) => b.title) ?? []),
        ...(c?.variants?.map((v) => v.title) ?? []),
        ...(c?.diagrams.map((d) => d.title) ?? []),
        ...(c?.interviewFollowUps?.map((f) => f.question) ?? []),
        ...(l.versionNotes?.map((v) => v.feature) ?? []),
      ].join(' \n '),
      body: [
        l.plainEnglish,
        l.technical,
        l.whyItExists,
        l.realWorld.title,
        l.realWorld.scenario,
        ...l.commonMistakes.map((x) => `${x.mistake} ${x.why} ${x.fix}`),
        ...l.examples.map((e) => `${e.title} ${e.explanation ?? ''}`),
        ...l.revision.map((r) => `${r.question} ${r.answer}`),
        ...(c?.breakdown.map((b) => b.body) ?? []),
        ...(c?.deepDive.map((d) => `${d.title} ${d.body}`) ?? []),
      ].join(' \n '),
    },
  ];
  // Every "types of X" entry is its own result, so "multilevel inheritance" or
  // "REQUIRES_NEW" leads straight to the lesson that explains it.
  for (const group of c?.variants ?? []) {
    for (const item of group.items) {
      docs.push({
        id: `topic:${l.id}:${group.title}:${item.name}`,
        kind: 'topic',
        title: item.name,
        context: `${group.title} · ${l.title}`,
        href,
        keywords: `${group.title} ${item.summary} ${item.note ?? ''}`,
        body: item.code ?? '',
      });
    }
  }
  return docs;
}

let cached: SearchDoc[] | undefined;

export function buildIndex(): SearchDoc[] {
  if (cached) return cached;
  const docs: SearchDoc[] = [];
  for (const m of MODULES) {
    docs.push({
      id: `module:${m.id}`,
      kind: 'module',
      title: m.title,
      context: `Module ${m.order} · ${m.lessons.length} lessons`,
      href: `/learn/${m.id}`,
      keywords: `${m.shortTitle} ${m.summary} ${(m.plannedTopics ?? []).join(' ')} ${m.lessons.map((l) => l.title).join(' ')}`,
      body: '',
    });
    for (const l of m.lessons) docs.push(...lessonDocs(m, l));
  }
  const moduleTitle = (id: string) => MODULES.find((m) => m.id === id)?.shortTitle ?? id;
  for (const c of CHALLENGES) {
    docs.push({
      id: `challenge:${c.id}`,
      kind: 'challenge',
      title: c.title,
      context: `${c.kind === 'boss' ? 'Boss challenge' : c.kind === 'debugging' ? 'Debugging challenge' : 'Coding challenge'} · ${moduleTitle(c.moduleId)}`,
      href: `/practice/${c.id}`,
      keywords: plain(c.description).slice(0, 400),
      body: plain(c.description),
    });
  }
  for (const q of INTERVIEW_QUESTIONS) {
    docs.push({
      id: `interview:${q.id}`,
      kind: 'interview',
      title: plain(q.prompt).slice(0, 140),
      context: `Interview · ${moduleTitle(q.moduleId)} · ${q.difficulty}`,
      href: `/interview/question/${q.id}`,
      keywords: plain(q.prompt),
      body: `${q.explanation ?? ''} ${(q.rubric ?? []).map((r) => JSON.stringify(r)).join(' ')}`,
    });
  }
  for (const b of BUG_HUNTS) {
    docs.push({ id: `bug:${b.id}`, kind: 'bug-hunt', title: b.title, context: `Bug hunt · ${moduleTitle(b.moduleId)}`, href: `/bug-hunter/${b.id}`, keywords: JSON.stringify(b).slice(0, 600), body: '' });
  }
  for (const i of INCIDENTS) {
    docs.push({ id: `incident:${i.id}`, kind: 'incident', title: i.title, context: 'Production incident', href: `/bug-hunter/incident/${i.id}`, keywords: JSON.stringify(i).slice(0, 800), body: '' });
  }
  for (const p of PROJECTS) {
    docs.push({ id: `project:${p.id}`, kind: 'project', title: p.title, context: 'Project', href: `/projects/${p.id}`, keywords: p.summary, body: p.milestones.map((m) => `${m.title} ${m.description}`).join(' ') });
  }
  for (const s of JVM_SCENARIOS) {
    docs.push({ id: `jvm:${s.id}`, kind: 'jvm', title: s.title, context: 'JVM Lab visualisation', href: `/jvm-lab/${s.id}`, keywords: s.summary, body: '' });
  }
  for (const f of JAVA_FEATURES) {
    docs.push({
      id: `feature:${f.id}`,
      kind: 'java-feature',
      title: f.title,
      context: `Java ${f.release} · ${f.status}${f.jep ? ` · JEP ${f.jep}` : ''}`,
      href: '/learn/java-versions',
      keywords: `${f.summary} java ${f.release} ${f.jep ? `jep ${f.jep}` : ''} ${f.category}`,
      body: f.example ?? '',
    });
  }
  cached = docs;
  return docs;
}

interface Prepared {
  doc: SearchDoc;
  title: string;
  titleWords: string[];
  keywords: string;
  keywordWords: Set<string>;
  body: string;
}

let prepared: Prepared[] | undefined;
function prepare(docs: SearchDoc[]): Prepared[] {
  if (prepared && docs === cached) return prepared;
  const out = docs.map((doc) => {
    const title = normalise(doc.title);
    const keywords = normalise(`${doc.keywords} ${doc.context}`);
    return { doc, title, titleWords: tokens(doc.title), keywords, keywordWords: new Set(tokens(keywords)), body: normalise(doc.body) };
  });
  if (docs === cached) prepared = out;
  return out;
}

const KIND_BOOST: Record<SearchKind, number> = {
  lesson: 1.5,
  topic: 1.0,
  module: 1.1,
  'java-feature': 1,
  challenge: 0.95,
  interview: 0.9,
  'bug-hunt': 0.9,
  incident: 0.85,
  project: 0.85,
  jvm: 0.9,
};

/** Treats simple plurals as the same word ("thread" / "threads"). */
const stem = (w: string) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);

function tokenScore(p: Prepared, token: string): number {
  const t = stem(token);
  // A match on the first word of a title ("Threads, executors…") is the strongest signal.
  if (p.titleWords[0] !== undefined && stem(p.titleWords[0]) === t) return 12;
  if (p.titleWords.some((w) => stem(w) === t)) return 10;
  if (p.titleWords.some((w) => w.startsWith(token))) return 7;
  if (token.length >= 3 && p.title.includes(token)) return 5;
  if (p.keywordWords.has(token)) return 4;
  if (token.length >= 3 && p.keywords.includes(token)) return 3;
  if (token.length >= 4 && p.titleWords.some((w) => levenshteinWithin1(w, token))) return 3.5;
  if (token.length >= 3 && p.body.includes(token)) return 1;
  if (token.length >= 5 && [...p.keywordWords].some((w) => levenshteinWithin1(w, token))) return 1.5;
  return 0;
}

function snippetFor(p: Prepared, doc: SearchDoc, terms: string[]): string | undefined {
  for (const source of [doc.keywords, doc.body]) {
    const text = plain(source).replace(/\s+/g, ' ');
    const lower = text.toLowerCase();
    for (const t of terms) {
      const at = lower.indexOf(t);
      if (at >= 0) {
        const start = Math.max(0, at - 50);
        const end = Math.min(text.length, at + t.length + 90);
        return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
      }
    }
  }
  return undefined;
}

/**
 * Ranks documents for a query. Every query word (or one of its synonyms) must
 * match somewhere; titles count most, then summaries/definitions, then full text.
 * Small typos are tolerated on longer words.
 */
export function search(query: string, options: { kinds?: SearchKind[]; limit?: number; docs?: SearchDoc[] } = {}): SearchResult[] {
  const terms = tokens(query).filter((t) => t.length > 1 || /\d/.test(t));
  if (terms.length === 0) return [];
  const docs = options.docs ?? buildIndex();
  const pool = prepare(docs).filter((p) => !options.kinds || options.kinds.includes(p.doc.kind));
  const phrase = normalise(query);
  const results: SearchResult[] = [];
  for (const p of pool) {
    let score = 0;
    let all = true;
    for (const t of terms) {
      const alternatives = [t, ...(SYNONYMS[t] ?? [])];
      let best = 0;
      for (const a of alternatives) best = Math.max(best, a === t ? tokenScore(p, a) : tokenScore(p, a) * 0.8);
      if (best === 0) {
        all = false;
        break;
      }
      score += best;
    }
    if (!all) continue;
    if (terms.length > 1 && p.title.includes(phrase)) score += 8;
    // An exact title match matters most for lessons and modules; topics (variant
    // entries) often share a name, e.g. several "HashMap" entries, so they get less.
    if (p.title === phrase) score += p.doc.kind === 'topic' ? 4 : 12;
    score *= KIND_BOOST[p.doc.kind];
    results.push({ doc: p.doc, score, snippet: snippetFor(p, p.doc, terms) });
  }
  results.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
  // Drop weak full-text-only matches when much better ones exist.
  const best = results[0]?.score ?? 0;
  return results.filter((r) => r.score >= best * 0.2).slice(0, options.limit ?? 50);
}

export const SUGGESTED_SEARCHES = [
  'types of inheritance',
  'polymorphism',
  'HashMap',
  'garbage collection',
  'virtual threads',
  'records',
  'BigDecimal',
  'Spring transactions',
  'binary search',
  'deadlock',
];
