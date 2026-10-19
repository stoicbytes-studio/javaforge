import { LESSONS } from '@/content';
import { CONCEPTS } from '@/content/concepts';
import { conceptProblems } from '@/lib/diagram';

describe('concept pages', () => {
  it('give every lesson an interview definition, mnemonic, breakdown, diagrams and deep dive', () => {
    const problems = LESSONS.flatMap((l) => conceptProblems(l.id, l.concepts));
    expect(problems).toEqual([]);
  });

  it('only describe lessons that exist', () => {
    const ids = new Set(LESSONS.map((l) => l.id));
    expect(Object.keys(CONCEPTS).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('use unique diagram ids', () => {
    const ids = Object.values(CONCEPTS).flatMap((c) => c.diagrams.map((d) => d.id));
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });
});
