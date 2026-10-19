import { ACHIEVEMENTS } from '@/features/gamification/achievements';
import { createCard, MAX_EASE, reviewCard } from '@/features/revision/scheduler';
import { useLearningStore } from '@/store/learningStore';

const store = () => useLearningStore.getState();

beforeEach(() => store().resetProgress());

describe('sync deletions (tombstones)', () => {
  it('keeps a removed bookmark removed when the cloud still has it', () => {
    store().toggleBookmark('o-enums');
    store().toggleBookmark('o-enums');
    expect(store().bookmarks).toEqual([]);
    store().mergeRemote({ bookmarks: ['o-enums', 't-regex'] });
    expect(store().bookmarks).toEqual(['t-regex']);
  });

  it('keeps a deleted note deleted unless it was edited elsewhere afterwards', () => {
    store().saveNote('t-regex', 'old');
    store().saveNote('t-regex', '   ');
    const deletedAt = store().tombstones.notes['t-regex']!;
    store().mergeRemote({ notes: { 't-regex': { text: 'old', updatedAt: deletedAt - 1000 } } });
    expect(store().notes['t-regex']).toBeUndefined();
    store().mergeRemote({ notes: { 't-regex': { text: 'newer on phone', updatedAt: deletedAt + 1000 } } });
    expect(store().notes['t-regex']?.text).toBe('newer on phone');
  });

  it('keeps an un-ticked milestone un-ticked', () => {
    store().toggleMilestone('expense-tracker', 'm1');
    store().toggleMilestone('expense-tracker', 'm1');
    store().mergeRemote({ milestones: { 'expense-tracker/m1': 1 } });
    expect(store().milestones['expense-tracker/m1']).toBeUndefined();
  });

  it('clears only the tombstones that were pushed', () => {
    store().toggleBookmark('a');
    store().toggleBookmark('a');
    const pushed = store().tombstones;
    store().toggleBookmark('b');
    store().toggleBookmark('b');
    store().clearTombstones(pushed);
    expect(Object.keys(store().tombstones.bookmarks)).toEqual(['b']);
  });

  it('re-adding a bookmark cancels its tombstone', () => {
    store().toggleBookmark('a');
    store().toggleBookmark('a');
    store().toggleBookmark('a');
    expect(store().tombstones.bookmarks).toEqual({});
  });
});

describe('account scoping', () => {
  it('resetProgress forgets the owner and sync position', () => {
    store().setOwner('user-a');
    store().markSynced(123);
    store().toggleBookmark('x');
    store().resetProgress();
    expect(store().ownerUserId).toBeUndefined();
    expect(store().lastSyncedAt).toBeUndefined();
    expect(store().bookmarks).toEqual([]);
  });
});

describe('revision ease', () => {
  it('never exceeds the database limit', () => {
    let card = createCard({ kind: 'prompt', lessonId: 'l', promptId: 'p' }, 0);
    for (let i = 0; i < 40; i++) card = reviewCard(card, 'easy', card.dueAt);
    expect(card.ease).toBeLessThanOrEqual(MAX_EASE);
  });
});

describe('No Hints Needed achievement', () => {
  it('counts only solves verified on a real Java runtime', () => {
    const ach = ACHIEVEMENTS.find((a) => a.id === 'unaided-five')!;
    const attempt = (i: number, verified: boolean) => ({
      id: `${i}`, itemType: 'challenge' as const, itemId: `ch-${i}`, dimension: 'coding' as const, correct: true, score: 1, hintsUsed: 0, verified, at: i,
    });
    const ctx = { attempts: [1, 2, 3, 4, 5].map((i) => attempt(i, false)), cards: [], incidentRuns: [], interviewSessions: [] };
    expect(ach.progress(ctx as never).current).toBe(0);
  });
});
