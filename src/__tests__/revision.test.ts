import { cardIdFor, createCard, dueCards, gradeScore, MIN_EASE, RELEARN_DELAY_MS, reviewCard } from '@/features/revision/scheduler';
import { DAY_MS, NOW } from '@/test-utils/fixtures';

const source = { kind: 'prompt' as const, lessonId: 'l1', promptId: 'r1' };

describe('revision scheduler', () => {
  it('schedules new cards for delayed recall the next day', () => {
    const card = createCard(source, NOW);
    expect(card.id).toBe(cardIdFor(source));
    expect(card.dueAt - NOW).toBe(DAY_MS);
    expect(dueCards([card], NOW)).toHaveLength(0);
    expect(dueCards([card], NOW + DAY_MS)).toHaveLength(1);
  });

  it('grows intervals 1 → 3 → ease-multiplied on good', () => {
    let card = createCard(source, NOW);
    card = reviewCard(card, 'good', NOW);
    expect(card.intervalDays).toBe(1);
    card = reviewCard(card, 'good', NOW);
    expect(card.intervalDays).toBe(3);
    card = reviewCard(card, 'good', NOW);
    expect(card.intervalDays).toBe(Math.round(3 * 2.5));
    expect(card.repetitions).toBe(3);
  });

  it('resets and relearns soon on again, lowering ease with a floor', () => {
    let card = createCard(source, NOW);
    card = reviewCard(card, 'good', NOW);
    card = reviewCard(card, 'good', NOW);
    for (let i = 0; i < 10; i++) card = reviewCard(card, 'again', NOW);
    expect(card.repetitions).toBe(0);
    expect(card.intervalDays).toBe(0);
    expect(card.lapses).toBe(10);
    expect(card.ease).toBe(MIN_EASE);
    expect(card.dueAt).toBe(NOW + RELEARN_DELAY_MS);
  });

  it('easy jumps further than good', () => {
    const base = createCard(source, NOW);
    expect(reviewCard(base, 'easy', NOW).intervalDays).toBeGreaterThan(reviewCard(base, 'good', NOW).intervalDays);
  });

  it('sorts due cards oldest first', () => {
    const a = { ...createCard(source, NOW), id: 'a', dueAt: NOW - 10 };
    const b = { ...createCard(source, NOW), id: 'b', dueAt: NOW - 100 };
    expect(dueCards([a, b], NOW).map((c) => c.id)).toEqual(['b', 'a']);
  });

  it('maps grades to retention scores', () => {
    expect(gradeScore('again')).toBe(0);
    expect(gradeScore('easy')).toBe(1);
  });
});
