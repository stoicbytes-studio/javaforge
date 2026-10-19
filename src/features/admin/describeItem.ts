import type { Href } from 'expo-router';

import { getBugHunt, getChallenge, getIncident, getInterviewQuestion, getModule, LESSONS } from '@/content';

export interface ItemDescription {
  title: string;
  context: string;
  href?: Href;
}

const plain = (s: string) => s.replace(/[`*_#>]/g, '').replace(/\s+/g, ' ').trim();
const truncate = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}...` : s);

const checkIndex = new Map(LESSONS.flatMap((l) => l.checks.map((c) => [c.id, { lesson: l, check: c }] as const)));

/** Maps an attempt's item id to a readable title and a link into the app, for admin reports. */
export function describeItem(itemType: string, itemId: string): ItemDescription {
  if (itemType === 'check') {
    const hit = checkIndex.get(itemId);
    if (hit) {
      return {
        title: truncate(plain(hit.check.prompt)),
        context: `Check · ${hit.lesson.title}`,
        href: `/learn/${hit.lesson.moduleId}/${hit.lesson.id}` as Href,
      };
    }
  }
  if (itemType === 'challenge') {
    const c = getChallenge(itemId);
    if (c) return { title: c.title, context: `${c.kind === 'boss' ? 'Boss challenge' : 'Challenge'} · ${getModule(c.moduleId)?.shortTitle ?? c.moduleId}`, href: `/practice/${c.id}` as Href };
  }
  if (itemType === 'interview') {
    const q = getInterviewQuestion(itemId);
    if (q) return { title: truncate(plain(q.prompt)), context: `Interview · ${getModule(q.moduleId)?.shortTitle ?? q.moduleId}`, href: `/interview/question/${q.id}` as Href };
  }
  if (itemType === 'bug-hunt') {
    const b = getBugHunt(itemId);
    if (b) return { title: b.title, context: 'Bug hunt', href: `/bug-hunter/${b.id}` as Href };
  }
  if (itemType === 'incident') {
    const i = getIncident(itemId);
    if (i) return { title: i.title, context: 'Production incident', href: `/bug-hunter/incident/${i.id}` as Href };
  }
  // Content removed or renamed since the attempt was recorded.
  return { title: itemId, context: `${itemType} (not in this app version)` };
}
