import { DIMENSION_LABELS, type MasterySnapshot } from '@/features/progress/mastery';
import type { MasteryDimension } from '@/types/curriculum';

/**
 * Career tiers require BOTH experience and demonstrated mastery, so a tier
 * cannot be reached by grinding easy questions alone.
 */

export type TierRequirement =
  | { kind: 'xp'; min: number }
  | { kind: 'module'; moduleId: string; label: string; min: number }
  | { kind: 'dimension'; dimension: MasteryDimension; min: number }
  | { kind: 'overall'; min: number };

export interface Tier {
  id: string;
  rank: number;
  title: string;
  description: string;
  requirements: TierRequirement[];
}

export const TIERS: Tier[] = [
  {
    id: 'foundations',
    rank: 1,
    title: 'Java Foundations',
    description: 'You are building the vocabulary: syntax, types, control flow and how a program runs.',
    requirements: [{ kind: 'xp', min: 0 }],
  },
  {
    id: 'app-developer',
    rank: 2,
    title: 'Application Developer',
    description: 'You can write small programs and model problems with classes and objects.',
    requirements: [
      { kind: 'xp', min: 400 },
      { kind: 'module', moduleId: 'fundamentals', label: 'Java Fundamentals', min: 0.5 },
      { kind: 'module', moduleId: 'oop', label: 'Object-Oriented Programming', min: 0.4 },
    ],
  },
  {
    id: 'core-engineer',
    rank: 3,
    title: 'Core Java Engineer',
    description: 'You handle strings, exceptions and collections correctly, including their edge cases.',
    requirements: [
      { kind: 'xp', min: 1200 },
      { kind: 'module', moduleId: 'types', label: 'Strings, Types & Generics', min: 0.5 },
      { kind: 'module', moduleId: 'exceptions', label: 'Exception Handling', min: 0.5 },
      { kind: 'module', moduleId: 'collections', label: 'Collections Framework', min: 0.5 },
      { kind: 'dimension', dimension: 'coding', min: 0.4 },
    ],
  },
  {
    id: 'advanced-engineer',
    rank: 4,
    title: 'Advanced Java Engineer',
    description: 'You write idiomatic modern Java and debug unfamiliar code with a method.',
    requirements: [
      { kind: 'xp', min: 2500 },
      { kind: 'module', moduleId: 'functional', label: 'Lambdas & Streams', min: 0.5 },
      { kind: 'dimension', dimension: 'coding', min: 0.55 },
      { kind: 'dimension', dimension: 'debugging', min: 0.45 },
    ],
  },
  {
    id: 'jvm-concurrency',
    rank: 5,
    title: 'JVM and Concurrency Specialist',
    description: 'You can reason about memory, garbage collection and threads under load.',
    requirements: [
      { kind: 'xp', min: 4000 },
      { kind: 'module', moduleId: 'jvm-runtime', label: 'JVM Runtime', min: 0.5 },
      { kind: 'module', moduleId: 'concurrency', label: 'Concurrency', min: 0.5 },
      { kind: 'dimension', dimension: 'runtime', min: 0.55 },
    ],
  },
  {
    id: 'backend-engineer',
    rank: 6,
    title: 'Backend Engineer',
    description: 'You build tested, persistent services with JDBC and Spring Boot.',
    requirements: [
      { kind: 'xp', min: 6000 },
      { kind: 'module', moduleId: 'jdbc', label: 'JDBC & Transactions', min: 0.5 },
      { kind: 'module', moduleId: 'testing', label: 'Testing & Code Quality', min: 0.5 },
      { kind: 'module', moduleId: 'spring', label: 'Spring Boot', min: 0.5 },
    ],
  },
  {
    id: 'production-ready',
    rank: 7,
    title: 'Production-Ready Engineer',
    description: 'You diagnose incidents from evidence and retain what you have learned.',
    requirements: [
      { kind: 'xp', min: 8500 },
      { kind: 'module', moduleId: 'production', label: 'Production Engineering', min: 0.5 },
      { kind: 'dimension', dimension: 'debugging', min: 0.65 },
      { kind: 'dimension', dimension: 'retention', min: 0.5 },
    ],
  },
  {
    id: 'mastery',
    rank: 8,
    title: 'Java Engineering Mastery',
    description: 'Consistently strong across every dimension, verified over time.',
    requirements: [
      { kind: 'xp', min: 12000 },
      { kind: 'overall', min: 0.7 },
      { kind: 'dimension', dimension: 'coding', min: 0.7 },
      { kind: 'dimension', dimension: 'debugging', min: 0.7 },
      { kind: 'dimension', dimension: 'runtime', min: 0.7 },
      { kind: 'dimension', dimension: 'interview', min: 0.7 },
      { kind: 'dimension', dimension: 'retention', min: 0.7 },
    ],
  },
];

export interface RequirementStatus {
  requirement: TierRequirement;
  label: string;
  current: number;
  target: number;
  met: boolean;
}

export function requirementStatus(req: TierRequirement, xp: number, mastery: MasterySnapshot): RequirementStatus {
  switch (req.kind) {
    case 'xp':
      return { requirement: req, label: `${req.min} XP`, current: xp, target: req.min, met: xp >= req.min };
    case 'module': {
      const current = mastery.modules[req.moduleId] ?? 0;
      return {
        requirement: req,
        label: `${req.label} mastery ${Math.round(req.min * 100)}%`,
        current,
        target: req.min,
        met: current >= req.min,
      };
    }
    case 'dimension': {
      const current = mastery.dimensions[req.dimension] ?? 0;
      return {
        requirement: req,
        label: `${DIMENSION_LABELS[req.dimension]} ${Math.round(req.min * 100)}%`,
        current,
        target: req.min,
        met: current >= req.min,
      };
    }
    case 'overall':
      return {
        requirement: req,
        label: `Overall mastery ${Math.round(req.min * 100)}%`,
        current: mastery.overall,
        target: req.min,
        met: mastery.overall >= req.min,
      };
  }
}

export interface TierProgress {
  current: Tier;
  next?: Tier;
  nextRequirements: RequirementStatus[];
}

/** Tiers are sequential: a tier counts only if every lower tier is also met. */
export function computeTier(xp: number, mastery: MasterySnapshot): TierProgress {
  let current = TIERS[0]!;
  for (const tier of TIERS) {
    const met = tier.requirements.every((r) => requirementStatus(r, xp, mastery).met);
    if (!met) break;
    current = tier;
  }
  const next = TIERS.find((t) => t.rank === current.rank + 1);
  return {
    current,
    next,
    nextRequirements: next ? next.requirements.map((r) => requirementStatus(r, xp, mastery)) : [],
  };
}
