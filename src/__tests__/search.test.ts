import { buildIndex, search } from '@/features/search/searchIndex';
import { LESSONS } from '@/content';

const top = (q: string, n = 3) => search(q).slice(0, n).map((r) => r.doc.id);

describe('global search', () => {
  it('indexes every lesson and every "types of X" entry', () => {
    const docs = buildIndex();
    for (const l of LESSONS) expect(docs.some((d) => d.id === `lesson:${l.id}`)).toBe(true);
    const topics = LESSONS.flatMap((l) => l.concepts?.variants?.flatMap((v) => v.items) ?? []);
    expect(docs.filter((d) => d.kind === 'topic')).toHaveLength(topics.length);
  });

  it('every result links somewhere inside the app', () => {
    for (const d of buildIndex()) expect(d.href.startsWith('/')).toBe(true);
  });

  it.each([
    ['inheritance types', 'lesson:o-inheritance-types'],
    ['types of polymorphism', 'lesson:o-polymorphism-types'],
    ['hashmap internals', 'lesson:c-hashmap'],
    ['garbage collection', 'lesson:r-gc'],
    ['virtual threads', 'lesson:cc-threads'],
    ['generics wildcards', 'lesson:t-generics'],
  ])('finds the right lesson for "%s"', (q, id) => {
    expect(top(q)).toContain(id);
  });

  it('finds individual variants such as multilevel inheritance', () => {
    const results = search('multilevel inheritance').slice(0, 3);
    expect(results.some((r) => r.doc.kind === 'topic' && r.doc.href === '/learn/oop/o-inheritance-types')).toBe(true);
  });

  it('expands abbreviations', () => {
    expect(top('gc', 5)).toContain('lesson:r-gc');
    expect(search('di').some((r) => r.doc.href.includes('sp-ioc-boot'))).toBe(true);
  });

  it('tolerates a small typo', () => {
    expect(top('polymorphsm', 5)).toContain('lesson:o-polymorphism-types');
  });

  it('requires every word to match and returns nothing for nonsense', () => {
    expect(search('zzqxv')).toEqual([]);
    expect(search('')).toEqual([]);
  });

  it('filters by kind', () => {
    const results = search('string', { kinds: ['challenge'] });
    expect(results.every((r) => r.doc.kind === 'challenge')).toBe(true);
  });

  it('gives a snippet showing where the match is', () => {
    const r = search('diamond problem')[0];
    expect(r?.snippet?.toLowerCase()).toContain('diamond');
  });
});
