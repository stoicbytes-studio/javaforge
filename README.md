# JavaForge — Engineering Mastery

A gamified, evidence-based Java learning app for web (desktop and mobile),
Android and iOS. It takes learners from their first program to backend
engineering topics. Progress is measured by what they demonstrate: answered
checks, code that passes tests on a real JVM, debugging, interview answers and
spaced-repetition recall.

JavaForge does not claim to make anyone "job-ready". It shows what you have
demonstrated and what to practise next.

## What's inside

- **Curriculum**: 17 modules and 78 lessons, from fundamentals, the JVM
  platform, OOP, types, exceptions, collections and functional Java to JVM
  runtime internals, concurrency and virtual threads, I/O, JDBC, testing,
  design patterns, DSA, Spring Boot, performance and production engineering.
  Every lesson opens with a **concept page**: an interview-level
  definition with follow-up questions, a memory mnemonic, analogies and
  real-world breakdowns, SVG illustrations plus flow and architecture
  diagrams, "types of X" sections (e.g. the five types of inheritance and
  how Java supports each), and a deep dive citing public sources (JLS, JVMS,
  JEPs, official docs). Then a plain-English explanation, technical detail, when (not)
  to use it, runnable examples, a line-by-line walkthrough, a real-world
  scenario, common mistakes, knowledge checks, mastery criteria and revision
  prompts.
- **Java version updates**: Java 8 → 27, separating final features from
  previews. Every claim is checked by compiling probes on real JDKs 8–27.
- **Playground and challenges**: 70 coding, debugging and boss challenges with
  tests, hints and solutions. Monaco editor on web. Code runs in a sandboxed
  execution service; when none is available, the app says so and switches to
  an honest simulation mode.
- **JVM Lab**: step-through visualisations of stack, heap, class loading and GC
  (simplified models, labelled as such).
- **Interview Arena**: question bank, timed mock sessions, rubric-based
  feedback (keyword rubric, not AI grading).
- **Bug Hunter and production incidents**: find the bug, then investigate
  simulated incidents using metrics, logs and diagnostics.
- **Projects**: nine milestone-based builds, from an expense tracker to a
  production-ready service.
- **Landing page and access control**: visitors see a landing page first; with
  Supabase configured, the learning portal opens only after sign-in (builds
  without Supabase stay open, local-only).
- **Accounts and admin**: optional sign-up/sign-in with email confirmation
  and password reset, and an admin dashboard with learner, activity and
  content-health reports ([docs/admin.md](docs/admin.md)).
- **Progress**: mastery across six dimensions (conceptual, coding, debugging,
  runtime, interview, retention), XP, career tiers, achievements, streaks,
  SM-2 revision and a recommended daily mission for 15/30/60/90-minute plans.

## Quick start

```bash
npm install
npm run web          # or: npm run android / npm run ios (Expo)
```

The app works without any backend: progress is stored on the device and code
runs in simulation mode. Optional services:

```bash
cp .env.example .env
# EXPO_PUBLIC_EXECUTOR_URL   → Java execution API (see docs/execution-api.md)
# EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY → accounts and sync
```

Only the Supabase **anon** key belongs in the app. Never put the service-role
key in an `EXPO_PUBLIC_*` variable.

### Java execution API

```bash
cd executor
mvn spring-boot:run        # needs Docker: one locked-down container per run
```

See [docs/execution-api.md](docs/execution-api.md) for the API, the sandbox
limits and deployment guidance.

### Supabase

Apply `supabase/migrations/*.sql` to your project (`supabase db push`, or the
SQL editor), then load the public content:

```bash
npm run seed:generate      # writes supabase/seed.sql from src/content
# run supabase/seed.sql with a privileged connection
```

Then sign up in the app and make yourself an admin; see [docs/admin.md](docs/admin.md).

## Deploying

Step-by-step guide for Vercel + Supabase: [docs/deployment.md](docs/deployment.md).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript (strict) |
| `npm run lint` | ESLint with the Expo config (`eslint.config.js`) |
| `npm test` | Jest unit and component tests |
| `npm run verify:java [filter]` | Compiles and runs all Java in the content on a local JDK 21+ (`--executor URL` to go through the API) |
| `npm run e2e` | Playwright against a test web export with a mocked Supabase (`npm run e2e:build` first) |
| `npm run test:db` | Migrations, seed, RLS and admin tests against Postgres (`PGURL=...`) |
| `npm run seed:generate` | Regenerates `supabase/seed.sql` |
| `npm run export:web` | Static web build in `dist/` |
| `cd executor && mvn test` | Execution API and sandbox tests |

## Project layout

```
src/app/         Expo Router routes
src/features/    feature screens and logic (lessons, playground, progress, ...)
src/components/  shared UI and the responsive app shell
src/content/     curriculum and practice content
src/store/       local-first learner records (Zustand, persisted)
src/services/    Supabase, auth, sync, code execution
executor/        Spring Boot Java execution API
supabase/        migrations and database tests
scripts/         content verification, Java version probes, seed generation
e2e/             Playwright tests
docs/            architecture and API docs
```

More detail: [docs/architecture.md](docs/architecture.md).

## Building for stores

Use EAS: `npx eas-cli@latest build --profile development` for a development
build, and `npx eas-cli@latest build` / `submit` for releases. Native
directories are generated (Continuous Native Generation); configure native
behaviour in `app.json`.
