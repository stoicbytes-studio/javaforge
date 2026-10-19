import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { INTERVIEW_PASS_SCORE } from '@/features/interviews/evaluator';
import { cardIdFor, createCard, gradeScore, reviewCard } from '@/features/revision/scheduler';
import { uuid } from '@/lib/id';
import type { Lesson } from '@/types/curriculum';
import type {
  Attempt,
  IncidentRun,
  InterviewSessionRecord,
  Note,
  RevisionCard,
  RevisionGrade,
  Settings,
} from '@/types/progress';

/**
 * Local-first learner state. Everything here is persisted on the device
 * (AsyncStorage, which is localStorage on web) so the app works without an
 * account; when signed in, src/services/sync.ts mirrors it to Supabase.
 */

export type NewAttempt = Omit<Attempt, 'id' | 'at'> & { at?: number };

export interface LearningState {
  attempts: Attempt[];
  cards: Record<string, RevisionCard>;
  bookmarks: string[];
  notes: Record<string, Note>;
  drafts: Record<string, string>;
  lastLessonId?: string;
  lessonVisits: Record<string, number>;
  interviewSessions: InterviewSessionRecord[];
  incidentRuns: IncidentRun[];
  milestones: Record<string, number>;
  settings: Settings;
  /** Timestamp of the last successful cloud sync. */
  lastSyncedAt?: number;
  /** The account this device's progress belongs to (undefined = not yet linked to an account). */
  ownerUserId?: string;
  /**
   * Deletions not yet pushed to the cloud (id -> time deleted). Without them a
   * removed bookmark, note or milestone would come back on the next merge.
   */
  tombstones: Tombstones;
}

export interface Tombstones {
  bookmarks: Record<string, number>;
  notes: Record<string, number>;
  milestones: Record<string, number>;
}

const NO_TOMBSTONES: Tombstones = { bookmarks: {}, notes: {}, milestones: {} };

export interface LearningActions {
  recordAttempt: (attempt: NewAttempt) => Attempt;
  scheduleLessonRevision: (lesson: Lesson, now?: number) => void;
  review: (cardId: string, grade: RevisionGrade, now?: number) => void;
  visitLesson: (lessonId: string, now?: number) => void;
  toggleBookmark: (lessonId: string) => void;
  saveNote: (lessonId: string, text: string) => void;
  saveDraft: (challengeId: string, code: string) => void;
  clearDraft: (challengeId: string) => void;
  startInterviewSession: (questionIds: string[], timed: boolean) => string;
  scoreInterviewQuestion: (sessionId: string, questionId: string, score: number) => void;
  finishInterviewSession: (sessionId: string) => void;
  recordIncidentRun: (run: IncidentRun) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  mergeRemote: (remote: Partial<Pick<LearningState, 'attempts' | 'cards' | 'bookmarks' | 'notes' | 'milestones'>>) => void;
  markSynced: (at: number) => void;
  /** Forgets deletions that have now been applied in the cloud. */
  clearTombstones: (pushed: Tombstones) => void;
  /** Links local progress to an account (see useAccountScope). */
  setOwner: (userId: string | undefined) => void;
  resetProgress: () => void;
}

export const DEFAULT_SETTINGS: Settings = {
  // Dark-first: light mode is opt-in (or follows the OS when set to "system").
  theme: 'light',
  motion: 'system',
  dailyMinutes: 30,
  executionMode: 'auto',
};

const initialState: LearningState = {
  attempts: [],
  cards: {},
  bookmarks: [],
  notes: {},
  drafts: {},
  lessonVisits: {},
  interviewSessions: [],
  incidentRuns: [],
  milestones: {},
  settings: DEFAULT_SETTINGS,
  tombstones: NO_TOMBSTONES,
};

const without = (record: Record<string, number>, key: string) => {
  const next = { ...record };
  delete next[key];
  return next;
};

export const milestoneKey = (projectId: string, milestoneId: string) => `${projectId}/${milestoneId}`;

export const useLearningStore = create<LearningState & LearningActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      recordAttempt: (input) => {
        const attempt: Attempt = { ...input, id: uuid(), at: input.at ?? Date.now() };
        set((state) => {
          const cards = { ...state.cards };
          // A wrong knowledge-check answer becomes a revision card so the
          // concept is re-tested after a delay.
          if (attempt.itemType === 'check' && !attempt.correct && attempt.lessonId) {
            const source = { kind: 'check' as const, lessonId: attempt.lessonId, checkId: attempt.itemId };
            const id = cardIdFor(source);
            if (!cards[id]) cards[id] = createCard(source, attempt.at);
          }
          return { attempts: [...state.attempts, attempt], cards };
        });
        return attempt;
      },

      scheduleLessonRevision: (lesson, now = Date.now()) =>
        set((state) => {
          const cards = { ...state.cards };
          let changed = false;
          for (const prompt of lesson.revision) {
            const source = { kind: 'prompt' as const, lessonId: lesson.id, promptId: prompt.id };
            const id = cardIdFor(source);
            if (!cards[id]) {
              cards[id] = createCard(source, now);
              changed = true;
            }
          }
          return changed ? { cards } : state;
        }),

      review: (cardId, grade, now = Date.now()) => {
        const card = get().cards[cardId];
        if (!card) return;
        const updated = reviewCard(card, grade, now);
        set((state) => ({ cards: { ...state.cards, [cardId]: updated } }));
        get().recordAttempt({
          itemType: 'revision',
          itemId: cardId,
          lessonId: card.source.lessonId,
          dimension: 'retention',
          correct: grade !== 'again',
          score: gradeScore(grade),
          hintsUsed: 0,
          verified: true,
          at: now,
        });
      },

      visitLesson: (lessonId, now = Date.now()) =>
        set((state) => ({ lastLessonId: lessonId, lessonVisits: { ...state.lessonVisits, [lessonId]: now } })),

      toggleBookmark: (lessonId) =>
        set((state) => {
          const removing = state.bookmarks.includes(lessonId);
          return {
            bookmarks: removing ? state.bookmarks.filter((id) => id !== lessonId) : [...state.bookmarks, lessonId],
            tombstones: {
              ...state.tombstones,
              bookmarks: removing ? { ...state.tombstones.bookmarks, [lessonId]: Date.now() } : without(state.tombstones.bookmarks, lessonId),
            },
          };
        }),

      saveNote: (lessonId, text) =>
        set((state) => {
          const notes = { ...state.notes };
          const now = Date.now();
          const deleting = text.trim().length === 0;
          if (deleting) delete notes[lessonId];
          else notes[lessonId] = { text, updatedAt: now };
          return {
            notes,
            tombstones: {
              ...state.tombstones,
              notes: deleting ? { ...state.tombstones.notes, [lessonId]: now } : without(state.tombstones.notes, lessonId),
            },
          };
        }),

      saveDraft: (challengeId, code) => set((state) => ({ drafts: { ...state.drafts, [challengeId]: code } })),

      clearDraft: (challengeId) =>
        set((state) => {
          const drafts = { ...state.drafts };
          delete drafts[challengeId];
          return { drafts };
        }),

      startInterviewSession: (questionIds, timed) => {
        const id = uuid();
        set((state) => ({
          interviewSessions: [...state.interviewSessions, { id, startedAt: Date.now(), questionIds, timed, scores: {} }],
        }));
        return id;
      },

      scoreInterviewQuestion: (sessionId, questionId, score) =>
        set((state) => ({
          interviewSessions: state.interviewSessions.map((s) =>
            s.id === sessionId ? { ...s, scores: { ...s.scores, [questionId]: score } } : s,
          ),
        })),

      finishInterviewSession: (sessionId) =>
        set((state) => ({
          interviewSessions: state.interviewSessions.map((s) =>
            s.id === sessionId ? { ...s, finishedAt: Date.now() } : s,
          ),
        })),

      recordIncidentRun: (run) => set((state) => ({ incidentRuns: [...state.incidentRuns, run] })),

      toggleMilestone: (projectId, milestoneId) =>
        set((state) => {
          const key = milestoneKey(projectId, milestoneId);
          const milestones = { ...state.milestones };
          const removing = !!milestones[key];
          if (removing) delete milestones[key];
          else milestones[key] = Date.now();
          return {
            milestones,
            tombstones: {
              ...state.tombstones,
              milestones: removing ? { ...state.tombstones.milestones, [key]: Date.now() } : without(state.tombstones.milestones, key),
            },
          };
        }),

      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),

      mergeRemote: (remote) =>
        set((state) => {
          const known = new Set(state.attempts.map((a) => a.id));
          const attempts = [...state.attempts, ...(remote.attempts ?? []).filter((a) => !known.has(a.id))].sort(
            (a, b) => a.at - b.at,
          );
          const cards = { ...state.cards };
          for (const card of Object.values(remote.cards ?? {})) {
            const local = cards[card.id];
            // Keep whichever copy was reviewed most recently.
            if (!local || (card.lastReviewedAt ?? card.createdAt) > (local.lastReviewedAt ?? local.createdAt)) {
              cards[card.id] = card;
            }
          }
          const { tombstones } = state;
          const notes = { ...state.notes };
          for (const [lessonId, note] of Object.entries(remote.notes ?? {})) {
            const local = notes[lessonId];
            const deletedAt = tombstones.notes[lessonId];
            // A note deleted here stays deleted unless it was edited elsewhere afterwards.
            if (deletedAt !== undefined && note.updatedAt <= deletedAt) continue;
            if (!local || note.updatedAt > local.updatedAt) notes[lessonId] = note;
          }
          const remoteMilestones = Object.fromEntries(Object.entries(remote.milestones ?? {}).filter(([key]) => tombstones.milestones[key] === undefined));
          return {
            attempts,
            cards,
            notes,
            bookmarks: [...new Set([...state.bookmarks, ...(remote.bookmarks ?? []).filter((id) => tombstones.bookmarks[id] === undefined)])],
            milestones: { ...remoteMilestones, ...state.milestones },
          };
        }),

      markSynced: (at) => set({ lastSyncedAt: at }),

      clearTombstones: (pushed) =>
        set((state) => {
          // Keep any deletion made after the push started (its timestamp changed).
          const prune = (current: Record<string, number>, done: Record<string, number>) =>
            Object.fromEntries(Object.entries(current).filter(([key, at]) => done[key] !== at));
          return {
            tombstones: {
              bookmarks: prune(state.tombstones.bookmarks, pushed.bookmarks),
              notes: prune(state.tombstones.notes, pushed.notes),
              milestones: prune(state.tombstones.milestones, pushed.milestones),
            },
          };
        }),

      setOwner: (userId) => set({ ownerUserId: userId }),

      // Optional fields are cleared explicitly: spreading initialState would leave them as they were.
      resetProgress: () =>
        set({ ...initialState, settings: get().settings, lastSyncedAt: undefined, lastLessonId: undefined, ownerUserId: undefined }),
    }),
    {
      name: 'javaforge-learning-v1',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // v2 introduced the yellow-and-white design and made light the default.
      // Version 1 stored the old default ('dark') for everyone, so move those to light;
      // learners can still pick dark or system in Settings.
      migrate: (persisted, version) => {
        const state = persisted as Partial<LearningState> | undefined;
        if (version < 2 && state?.settings?.theme === 'dark') {
          return { ...state, settings: { ...state.settings, theme: 'light' } } as LearningState;
        }
        return state as LearningState;
      },
    },
  ),
);

export const isInterviewPass = (score: number) => score >= INTERVIEW_PASS_SCORE;

/** True once persisted state has been loaded from storage. */
export function useHasHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useLearningStore.persist.onFinishHydration(onChange),
    () => useLearningStore.persist.hasHydrated(),
    () => false,
  );
}
