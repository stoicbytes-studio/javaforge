import { getLesson } from '@/content';
import { JAVA_FEATURES, JAVA_RELEASES, PROBED_JDKS } from '@/content/versions/javaReleases';
import { PROBE_RESULTS } from '@/content/versions/probes.generated';

/**
 * Every version claim that has a probe must agree with what real JDKs did
 * when the probe was compiled (scripts/probe-java-versions.mjs).
 */
describe('Java version claims', () => {
  const probed = JAVA_FEATURES.filter((f) => f.probe);

  it('has probe results for every probed feature', () => {
    for (const f of probed) {
      expect(PROBE_RESULTS[f.id]).toBeDefined();
      for (const v of PROBED_JDKS) expect(PROBE_RESULTS[f.id]![v]).toBeDefined();
    }
  });

  it.each(probed.map((f) => [f.id, f] as const))('%s matches the probe results', (_id, f) => {
    const r = PROBE_RESULTS[f.id]!;
    const before = PROBED_JDKS.filter((v) => v < f.release);
    const from = PROBED_JDKS.filter((v) => v >= f.release);
    switch (f.status) {
      case 'final':
        for (const v of from) expect([v, r[v]]).toEqual([v, 'final']);
        for (const v of before) expect([v, r[v]]).not.toEqual([v, 'final']);
        break;
      case 'preview':
        if (PROBED_JDKS.includes(f.release as never)) expect(r[f.release]).toBe('preview');
        break;
      case 'removed': {
        const last = before[before.length - 1];
        if (last !== undefined) expect(r[last]).toBe('final');
        for (const v of from) expect([v, r[v]]).toEqual([v, 'absent']);
        break;
      }
      default:
        break;
    }
    for (const v of f.previewedIn ?? []) {
      if (PROBED_JDKS.includes(v as never)) expect([v, r[v]]).toEqual([v, 'preview']);
    }
  });

  it('lists every release from 8 to the newest exactly once, with LTS flags', () => {
    const versions = JAVA_RELEASES.map((r) => r.version);
    expect(versions).toEqual(Array.from({ length: versions.length }, (_, i) => 8 + i));
    expect(JAVA_RELEASES.filter((r) => r.lts).map((r) => r.version)).toEqual([8, 11, 17, 21, 25]);
  });

  it('attaches features only to known releases and existing lessons', () => {
    const known = new Set(JAVA_RELEASES.map((r) => r.version));
    for (const f of JAVA_FEATURES) {
      expect(known.has(f.release)).toBe(true);
      for (const id of f.lessonIds ?? []) expect(getLesson(id)).toBeDefined();
    }
    expect(new Set(JAVA_FEATURES.map((f) => f.id)).size).toBe(JAVA_FEATURES.length);
  });
});
