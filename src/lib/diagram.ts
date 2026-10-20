import type { Diagram, DiagramNode, LessonConcepts } from '@/types/curriculum';

/** Grid geometry shared by the SVG renderer and the content tests. */
export const CELL_W = 168;
export const CELL_H = 64;
export const GAP_X = 64;
export const GAP_Y = 40;
export const PAD = 20;
/** Extra room at the top of a group for its label. */
export const GROUP_LABEL = 24;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function nodeRect(n: DiagramNode): Rect {
  const span = n.span ?? 1;
  return {
    x: PAD + n.col * (CELL_W + GAP_X),
    y: PAD + GROUP_LABEL + n.row * (CELL_H + GAP_Y),
    w: span * CELL_W + (span - 1) * GAP_X,
    h: CELL_H,
  };
}

export function diagramSize(d: Diagram): { width: number; height: number } {
  return {
    width: PAD * 2 + d.cols * CELL_W + (d.cols - 1) * GAP_X,
    height: PAD * 2 + GROUP_LABEL + d.rows * CELL_H + (d.rows - 1) * GAP_Y,
  };
}

export function groupRect(g: { fromCol: number; toCol: number; fromRow: number; toRow: number }): Rect {
  const x = PAD + g.fromCol * (CELL_W + GAP_X) - GAP_X / 2 + 6;
  const y = PAD + GROUP_LABEL + g.fromRow * (CELL_H + GAP_Y) - GAP_Y / 2 - 14;
  const x2 = PAD + g.toCol * (CELL_W + GAP_X) + CELL_W + GAP_X / 2 - 6;
  const y2 = PAD + GROUP_LABEL + g.toRow * (CELL_H + GAP_Y) + CELL_H + GAP_Y / 2 - 6;
  return { x, y, w: x2 - x, h: y2 - y };
}

/**
 * Connects two boxes from the edge of one to the edge of the other, picking the
 * sides that face each other so arrows never cross their own boxes.
 */
export function edgePoints(a: Rect, b: Rect): { x1: number; y1: number; x2: number; y2: number } {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const horizontalOverlap = a.x < b.x + b.w && b.x < a.x + a.w;
  const verticalOverlap = a.y < b.y + b.h && b.y < a.y + a.h;
  if (horizontalOverlap && !verticalOverlap) {
    // Stacked: connect bottom/top, at the middle of the shared horizontal span.
    const x = (Math.max(a.x, b.x) + Math.min(a.x + a.w, b.x + b.w)) / 2;
    return bc.y > ac.y ? { x1: x, y1: a.y + a.h, x2: x, y2: b.y } : { x1: x, y1: a.y, x2: x, y2: b.y + b.h };
  }
  if (verticalOverlap && !horizontalOverlap) {
    const y = (Math.max(a.y, b.y) + Math.min(a.y + a.h, b.y + b.h)) / 2;
    return bc.x > ac.x ? { x1: a.x + a.w, y1: y, x2: b.x, y2: y } : { x1: a.x, y1: y, x2: b.x + b.w, y2: y };
  }
  // Diagonal: leave from the bottom/top and arrive at the top/bottom.
  return bc.y > ac.y
    ? { x1: ac.x, y1: a.y + a.h, x2: bc.x, y2: b.y }
    : { x1: ac.x, y1: a.y, x2: bc.x, y2: b.y + b.h };
}

/** Splits text into lines of at most `max` characters, breaking on spaces where possible. */
export function wrapText(text: string, max: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (!line) line = word;
      else if ((line + ' ' + word).length <= max) line += ' ' + word;
      else {
        lines.push(line);
        line = word;
      }
      while (line.length > max) {
        lines.push(line.slice(0, max));
        line = line.slice(max);
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

export const charsPerLine = (n: DiagramNode, fontSize: number) => Math.floor((nodeRect(n).w - 16) / (fontSize * 0.56));

/** Structural problems that would make a diagram render badly. Empty when the diagram is sound. */
export function validateDiagram(d: Diagram): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const cells = new Map<string, string>();
  if (d.cols < 1 || d.cols > 5) errors.push(`${d.id}: cols must be 1-5 (got ${d.cols})`);
  if (d.rows < 1 || d.rows > 8) errors.push(`${d.id}: rows must be 1-8 (got ${d.rows})`);
  if (d.nodes.length < 2) errors.push(`${d.id}: needs at least 2 nodes`);
  for (const n of d.nodes) {
    if (ids.has(n.id)) errors.push(`${d.id}: duplicate node id ${n.id}`);
    ids.add(n.id);
    const span = n.span ?? 1;
    if (n.col < 0 || n.row < 0 || n.col + span > d.cols || n.row >= d.rows) errors.push(`${d.id}: node ${n.id} is outside the ${d.cols}x${d.rows} grid`);
    for (let c = n.col; c < n.col + span; c++) {
      const key = `${c},${n.row}`;
      const other = cells.get(key);
      if (other) errors.push(`${d.id}: nodes ${other} and ${n.id} overlap at ${key}`);
      cells.set(key, n.id);
    }
    const labelLines = wrapText(n.label, charsPerLine(n, 13)).length;
    const detailLines = n.detail ? wrapText(n.detail, charsPerLine(n, 11)).length : 0;
    if (labelLines + detailLines > 3) errors.push(`${d.id}: node ${n.id} text is too long for its box (${labelLines + detailLines} lines; max 3, or widen with span)`);
  }
  for (const e of d.edges) {
    if (!ids.has(e.from)) errors.push(`${d.id}: edge from unknown node ${e.from}`);
    if (!ids.has(e.to)) errors.push(`${d.id}: edge to unknown node ${e.to}`);
    if (e.from === e.to) errors.push(`${d.id}: edge ${e.from} -> itself`);
    if (e.label && e.label.length > 22) errors.push(`${d.id}: edge label "${e.label}" is longer than 22 characters`);
  }
  for (const g of d.groups ?? []) {
    if (g.fromCol < 0 || g.toCol >= d.cols || g.fromRow < 0 || g.toRow >= d.rows || g.fromCol > g.toCol || g.fromRow > g.toRow) {
      errors.push(`${d.id}: group "${g.label}" is outside the grid`);
    }
  }
  if (!d.caption.trim()) errors.push(`${d.id}: caption is empty`);
  errors.push(...explanationProblems(d));
  return errors;
}

const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const normalise = (s: string) => s.replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Rules for a diagram's "How to read this diagram" steps: 3-7 steps of 8-55 words
 * that between them name at least 60% of the boxes, so the walkthrough is about
 * this diagram rather than generic prose.
 */
export function explanationProblems(d: Diagram): string[] {
  const e: string[] = [];
  const steps = d.explanation;
  if (!steps?.length) return [`${d.id}: needs an explanation (3-7 steps walking through the diagram)`];
  if (steps.length < 3 || steps.length > 7) e.push(`${d.id}: explanation needs 3-7 steps (has ${steps.length})`);
  steps.forEach((s, i) => {
    const w = countWords(s);
    if (w < 8 || w > 55) e.push(`${d.id}: explanation step ${i + 1} should be 8-55 words (has ${w})`);
  });
  const text = normalise(steps.join(' '));
  const missing = d.nodes.filter((n) => !text.includes(normalise(n.label)));
  if (missing.length > d.nodes.length * 0.4) {
    e.push(`${d.id}: explanation should name most boxes; missing ${missing.map((n) => `"${n.label}"`).join(', ')}`);
  }
  return e;
}

/** Text alternative for screen readers: what is on the diagram and how it connects. */
export function describeDiagram(d: Diagram): string {
  const label = (id: string) => d.nodes.find((n) => n.id === id)?.label ?? id;
  const parts = [`${d.title}. ${d.caption}`];
  parts.push(`Elements: ${d.nodes.map((n) => (n.detail ? `${n.label} (${n.detail})` : n.label)).join('; ')}.`);
  if (d.edges.length) {
    parts.push(`Connections: ${d.edges.map((e) => `${label(e.from)} ${e.both ? 'and' : 'to'} ${label(e.to)}${e.label ? ` (${e.label})` : ''}`).join('; ')}.`);
  }
  if (d.groups?.length) parts.push(`Groups: ${d.groups.map((g) => g.label).join('; ')}.`);
  return parts.join(' ').replace(/`/g, '');
}

/**
 * Every rule a lesson's concept page must satisfy. Used by the content tests and
 * by scripts/check-concepts.mjs. Returns human-readable problems; empty when sound.
 */
export function conceptProblems(lessonId: string, c: LessonConcepts | undefined): string[] {
  if (!c) return [`${lessonId}: no concept page`];
  const p: string[] = [];
  if (!c.textbook) p.push(`${lessonId}: needs a textbook definition`);
  else {
    const tw = countWords(c.textbook.definition);
    if (tw < 40 || tw > 130) p.push(`${lessonId}: textbook definition should be 40-130 words (has ${tw})`);
    if (c.textbook.terms.length < 2 || c.textbook.terms.length > 6) p.push(`${lessonId}: textbook definition needs 2-6 key terms (has ${c.textbook.terms.length})`);
    for (const t of c.textbook.terms) {
      const mw = countWords(t.meaning);
      if (!t.term.trim() || mw < 6 || mw > 50) p.push(`${lessonId}: key term "${t.term}" needs a 6-50 word meaning (has ${mw})`);
    }
  }
  if (!c.variants?.length) p.push(`${lessonId}: needs at least one "types of" variant group`);
  const words = c.interviewDefinition.split(/\s+/).length;
  if (words < 25 || words > 110) p.push(`${lessonId}: interview definition should be 25-110 words (has ${words})`);
  if (c.mnemonic.expansion.length < 2) p.push(`${lessonId}: mnemonic needs at least 2 parts`);
  if (c.breakdown.length < 3) p.push(`${lessonId}: breakdown needs at least 3 items`);
  if (!c.breakdown.some((b) => b.kind === 'analogy')) p.push(`${lessonId}: breakdown needs an analogy`);
  if (!c.breakdown.some((b) => b.kind === 'real-world')) p.push(`${lessonId}: breakdown needs a real-world example`);
  if (c.diagrams.length < 2) p.push(`${lessonId}: needs at least 2 diagrams`);
  if (!c.diagrams.some((d) => d.kind === 'concept')) p.push(`${lessonId}: needs a concept illustration`);
  if (!c.diagrams.some((d) => d.kind === 'flow' || d.kind === 'architecture')) p.push(`${lessonId}: needs a flow or architecture diagram`);
  for (const d of c.diagrams) p.push(...validateDiagram(d).map((e) => `${lessonId}: ${e}`));
  if (c.deepDive.length < 2) p.push(`${lessonId}: deep dive needs at least 2 items`);
  for (const v of c.variants ?? []) if (v.items.length < 2) p.push(`${lessonId}: variant group "${v.title}" needs at least 2 items`);
  return p;
}
