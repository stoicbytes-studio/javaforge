import { PICTOGRAMS } from '@/components/pictograms';
import { LESSONS } from '@/content';
import { MEMORY } from '@/content/memory';
import { illustrationProblems, memoryProblems } from '@/lib/illustration';

describe('"Make it stick" memory aids', () => {
  it('give every lesson a plain-English story, three key points, recall questions and a picture', () => {
    const problems = LESSONS.flatMap((l) => memoryProblems(l.id, l.memory));
    expect(problems).toEqual([]);
  });

  it('only describe lessons that exist', () => {
    const ids = new Set(LESSONS.map((l) => l.id));
    expect(Object.keys(MEMORY).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('only use pictograms that exist', () => {
    const unknown = Object.entries(MEMORY).flatMap(([id, m]) => m.picture.items.filter((i) => !PICTOGRAMS[i.icon]).map((i) => `${id}: ${i.icon}`));
    expect(unknown).toEqual([]);
  });

  it('reject pictures whose items overlap, leave the canvas or have dangling arrows', () => {
    const problems = illustrationProblems({
      title: 'Bad',
      caption: 'Broken on purpose.',
      items: [
        { icon: 'box', label: 'A', x: 10, y: 10 },
        { icon: 'box', label: 'B', x: 12, y: 12 },
        { icon: 'box', label: 'C', x: 99, y: 59 },
      ],
      arrows: [{ from: 0, to: 5 }],
    });
    expect(problems.some((p) => p.includes('overlap'))).toBe(true);
    expect(problems.some((p) => p.includes('does not fit'))).toBe(true);
    expect(problems.some((p) => p.includes('missing item'))).toBe(true);
  });
});
