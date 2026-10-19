# Architecture

JavaForge has three parts:

1. **The app** (`src/`): Expo + React Native + Expo Router, one codebase for web
   (desktop and mobile browsers), Android and iOS.
2. **The Java execution API** (`executor/`): a Spring Boot service that compiles
   and runs learner code in disposable sandboxes. See [execution-api.md](execution-api.md).
3. **Supabase** (`supabase/`): Postgres, Auth and row-level security, used only
   when the learner signs in. The app works fully without it.

## App layers

```
src/app/          routes only (Expo Router): thin files that render feature screens
src/features/     screens and the logic behind them, one folder per feature
src/components/   shared UI primitives (Text, Button, Card, Markdown, charts, shell)
src/content/      the curriculum: modules, lessons, challenges, interview bank,
                  bug hunts, incidents, projects, JVM scenarios, Java releases
src/store/        Zustand store with the learner's private records (persisted)
src/services/     Supabase client, auth, sync, Java execution clients
src/theme/        design tokens, theme provider, responsive layout breakpoints
src/types/        shared types for content and progress
```

### Responsive shell

`src/components/shell/AppShell.tsx` uses Expo Router's headless tabs. At widths
of 768 px and up the navigation is a sidebar (collapsible); below that it is a
bottom tab bar with the four primary destinations plus "More". Lesson and
challenge screens switch between multi-pane layouts (expanded, ≥1100 px) and
focused tabs (compact).

### Content

Content lives in TypeScript files in the app bundle, so the whole curriculum
works offline and for anonymous learners. Content files use only type imports,
which lets Node scripts load them directly:

- `npm run verify:java` compiles and runs every runnable example, every
  predict-the-output answer, every challenge's reference solution (must pass all
  tests) and starter code (must compile and fail at least one test) on a real JDK.
- `scripts/probe-java-versions.mjs` compiles feature probes on JDK 8–27 so the
  Java versions page states only verified final/preview status.
- `npm run seed:generate` mirrors the content into the public Postgres tables.

Each lesson's concept page lives in `src/content/concepts/<module>.ts`, keyed
by lesson id. Diagrams are grid data (`src/lib/diagram.ts`) rendered as SVG by
`DiagramView` on every platform; `scripts/check-concepts.mjs`
and the concept test validate layout (no overlaps, text fits) and require all
five sections on every lesson.

Modules that are not written yet are shown as "planned" with their topic
outline; the content test suite fails if a module has neither lessons nor a
plan.

### Learner model

The store holds raw evidence only: attempts, revision cards, bookmarks, notes,
drafts, interview sessions, incident runs and project milestones. Everything
else is derived on the fly in `src/features/progress` and
`src/features/gamification`:

- **Mastery** per item is an exponentially weighted average of attempt quality
  (score, reduced by hints, halved when unverified). Lesson, module and
  dimension mastery aggregate items; unattempted items count as zero.
  Dimensions: conceptual, coding, debugging, runtime, interview, retention.
- **Retention** comes from SM-2 spaced-repetition cards.
- **XP** is awarded once per item at its best quality; projects award none
  because they are self-reported.
- **Career tiers** need XP *and* module/dimension mastery, so they cannot be
  reached by grinding easy items.
- **Achievements** are predicates over the evidence; **streaks** count days with
  at least one correct attempt.
- **Recommendations** pick the next mission (due revision, repairing weak concepts,
  the next lesson, coding, interview and debugging practice) and explain why.

Because derived values are recomputed from evidence, syncing only needs to move
raw records, and nothing a client uploads can unlock anything by itself.

## Sync and security

- The app uses only the Supabase **anon key**. The service-role key is never
  shipped to clients; it is needed only to apply the content seed.
- Private tables (`attempts`, `revision_cards`, `bookmarks`, `notes`,
  `user_project_milestones`, `interview_sessions`, `mastery_records`,
  `learning_streaks`, `user_achievements`, `profiles`) have RLS policies that
  restrict every operation to `auth.uid() = user_id`. Attempts are append-only.
- Public content tables are readable by everyone and writable by nobody through
  the API.
- Sync is local-first: the device store is the source of truth offline; after
  sign-in, records are merged (attempts by id, cards and notes by recency,
  bookmarks and milestones by union) and upserted.
- Admins are listed in `admin_users` (not writable through the API) and read
  aggregate reports through `security definer` functions that check
  `is_admin()`; see [admin.md](admin.md).
- `npm run test:db` applies migrations and the seed to a scratch Postgres and
  runs the RLS and admin tests in `supabase/tests`.

## Code execution in the app

`src/services/execution` chooses an executor: the remote API when configured
and healthy, otherwise simulation mode. The playground shows which one is in
use. Simulation mode never claims to have run code; coding attempts made in it
are stored with `verified: false`.

The editor is Monaco on web (self-hosted from `public/monaco`, copied from
`node_modules` by `postinstall`) and a lightweight monospace editor on native.

## Testing

- `npm test` — Jest + React Native Testing Library: mastery, revision, XP,
  tiers, achievements, recommendations, interview rubric calibration, content
  integrity and Java version consistency.
- `npm run verify:java` — real-JDK verification of all Java in the content.
- `npm run e2e` — Playwright against the static web export, desktop and mobile
  viewports.
- `cd executor && mvn test` — API validation, rate limiting, local runner and
  Docker sandbox tests (no network, read-only file system, unprivileged user,
  thread explosions, infinite loops, runaway output, heap limit).
- `npm run test:db` — migrations, seed and RLS.
