import type { Illustration, IllustrationItem, MemoryAid } from '@/types/curriculum';

/**
 * Geometry for "Make it stick" pictures. Content is placed on a 100 x 60 canvas
 * (item x/y is the centre of its icon); the renderer draws it at SCALE pixels per
 * unit. Shared by the SVG renderer, the content tests and scripts/check-memory.mjs.
 */
export const CANVAS_W = 100;
export const CANVAS_H = 60;
export const SCALE = 5;
/** Icon edge length in canvas units at size 1. */
export const ICON = 13;
export const LABEL_SIZE = 3.1;
export const LABEL_GAP = 1.2;
const CHAR_W = LABEL_SIZE * 0.56;
export const MAX_LABEL = 18;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const iconSize = (item: IllustrationItem) => ICON * (item.size ?? 1);

/** The icon plus its label underneath. */
export function itemBox(item: IllustrationItem): Box {
  const s = iconSize(item);
  const w = Math.max(s, item.label.length * CHAR_W + 2);
  const h = s + LABEL_GAP + LABEL_SIZE + 0.8;
  return { x: item.x - w / 2, y: item.y - s / 2, w, h };
}

/** Distance from a point inside a box to its edge along (ux, uy). */
function exitDistance(px: number, py: number, ux: number, uy: number, b: Box): number {
  const tx = ux > 0 ? (b.x + b.w - px) / ux : ux < 0 ? (b.x - px) / ux : Infinity;
  const ty = uy > 0 ? (b.y + b.h - py) / uy : uy < 0 ? (b.y - py) / uy : Infinity;
  return Math.min(tx, ty);
}

/**
 * Where an arrow between two items starts and ends: just outside each item's
 * icon-and-label box, so arrows never run over a label.
 */
export function arrowPoints(a: IllustrationItem, b: IllustrationItem) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const ra = exitDistance(a.x, a.y, ux, uy, itemBox(a)) + 1;
  const rb = exitDistance(b.x, b.y, -ux, -uy, itemBox(b)) + 1.5;
  return { x1: a.x + ux * ra, y1: a.y + uy * ra, x2: b.x - ux * rb, y2: b.y - uy * rb, length: len - ra - rb };
}

const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Layout problems that would make a picture render badly. Empty when it is sound. */
export function illustrationProblems(p: Illustration): string[] {
  const e: string[] = [];
  if (!p.title.trim()) e.push('picture title is empty');
  if (!p.caption.trim()) e.push('picture caption is empty');
  if (p.items.length < 3 || p.items.length > 7) e.push(`picture needs 3-7 items (has ${p.items.length})`);
  p.items.forEach((item, i) => {
    const b = itemBox(item);
    if (!item.label.trim()) e.push(`picture item ${i} has no label`);
    if (item.label.length > MAX_LABEL) e.push(`picture label "${item.label}" is longer than ${MAX_LABEL} characters`);
    if (item.size !== undefined && (item.size < 0.6 || item.size > 1.6)) e.push(`picture item "${item.label}" size must be 0.6-1.6`);
    if (b.x < 0 || b.y < 0 || b.x + b.w > CANVAS_W || b.y + b.h > CANVAS_H) {
      e.push(`picture item "${item.label}" at (${item.x}, ${item.y}) does not fit the 100x60 canvas`);
    }
    for (let j = 0; j < i; j++) {
      if (overlaps(b, itemBox(p.items[j]!))) e.push(`picture items "${p.items[j]!.label}" and "${item.label}" overlap`);
    }
  });
  for (const a of p.arrows ?? []) {
    const from = p.items[a.from];
    const to = p.items[a.to];
    if (!from || !to) {
      e.push(`picture arrow ${a.from} -> ${a.to} points at a missing item`);
      continue;
    }
    if (a.from === a.to) e.push(`picture arrow ${a.from} -> itself`);
    const len = arrowPoints(from, to).length;
    if (len < 4) e.push(`picture arrow "${from.label}" -> "${to.label}" is too short to see; move the items apart`);
    if (a.label && a.label.length > 14) e.push(`picture arrow label "${a.label}" is longer than 14 characters`);
    const pts = arrowPoints(from, to);
    p.items.forEach((other, k) => {
      if (k === a.from || k === a.to) return;
      const box = itemBox(other);
      for (let t = 0; t <= 1; t += 0.05) {
        const x = pts.x1 + (pts.x2 - pts.x1) * t;
        const y = pts.y1 + (pts.y2 - pts.y1) * t;
        if (x > box.x && x < box.x + box.w && y > box.y && y < box.y + box.h) {
          e.push(`picture arrow "${from.label}" -> "${to.label}" crosses "${other.label}"`);
          return;
        }
      }
    });
    if (a.label && len < a.label.length * 1.4 + 9) e.push(`picture arrow label "${a.label}" does not fit its arrow; move the items apart`);
  }
  return e;
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/**
 * Every rule a lesson's "Make it stick" part must satisfy. Used by the content
 * tests and scripts/check-memory.mjs. Returns human-readable problems.
 */
export function memoryProblems(lessonId: string, m: MemoryAid | undefined): string[] {
  if (!m) return [`${lessonId}: no "Make it stick" memory aid`];
  const p: string[] = [];
  const one = words(m.oneLiner);
  if (one < 5 || one > 24) p.push(`${lessonId}: oneLiner should be 5-24 words (has ${one})`);
  const story = words(m.story);
  if (story < 40 || story > 130) p.push(`${lessonId}: story should be 40-130 words (has ${story})`);
  if (m.keyPoints.length !== 3) p.push(`${lessonId}: needs exactly 3 key points`);
  m.keyPoints.forEach((k, i) => {
    if (words(k) < 3 || words(k) > 25) p.push(`${lessonId}: key point ${i + 1} should be 3-25 words`);
  });
  if (m.confusion && (!m.confusion.mixedUpWith.trim() || words(m.confusion.difference) < 8)) p.push(`${lessonId}: confusion needs a name and a difference of at least 8 words`);
  if (m.tryIt !== undefined && (words(m.tryIt) < 6 || words(m.tryIt) > 60)) p.push(`${lessonId}: tryIt should be 6-60 words`);
  if (m.recall.length < 2 || m.recall.length > 3) p.push(`${lessonId}: needs 2-3 recall questions (has ${m.recall.length})`);
  for (const r of m.recall) {
    if (!r.question.trim().endsWith('?')) p.push(`${lessonId}: recall question "${r.question}" should end with "?"`);
    if (words(r.answer) < 2 || words(r.answer) > 45) p.push(`${lessonId}: recall answer to "${r.question}" should be 2-45 words`);
  }
  p.push(...illustrationProblems(m.picture).map((e) => `${lessonId}: ${e}`));
  return p;
}

/** Text alternative for screen readers. */
export function describeIllustration(p: Illustration): string {
  const parts = [`${p.title}. ${p.caption}`, `Shows: ${p.items.map((i) => i.label).join(', ')}.`];
  if (p.arrows?.length) {
    parts.push(`Arrows: ${p.arrows.map((a) => `${p.items[a.from]?.label} to ${p.items[a.to]?.label}${a.label ? ` (${a.label})` : ''}`).join('; ')}.`);
  }
  return parts.join(' ').replace(/`/g, '');
}
