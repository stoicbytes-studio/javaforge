-- JavaForge initial schema.
--
-- Two kinds of data live here:
--   * public curriculum content (modules, lessons, challenges, interview
--     questions, achievements) — readable by everyone, writable only by the
--     service role through scripts/generate-seed.mjs output;
--   * private learning records — every row belongs to one auth user and is
--     protected by row-level security so a user can only touch their own rows.
--
-- Private tables reference content by text id without foreign keys on
-- purpose: content ships in the app bundle and may be updated (or a lesson
-- renamed) independently of the database, and a learner's history must never
-- be rejected or cascaded away because of a content release.

-- ---------------------------------------------------------------------------
-- Public curriculum content
-- ---------------------------------------------------------------------------

create table public.modules (
  id text primary key,
  position smallint not null unique check (position > 0),
  title text not null,
  short_title text not null,
  summary text not null,
  level text not null check (level in ('core', 'advanced', 'optional')),
  prerequisites text[] not null default '{}',
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id text primary key,
  module_id text not null references public.modules (id) on delete cascade,
  position smallint not null check (position >= 0),
  title text not null,
  difficulty text not null,
  estimated_minutes smallint not null check (estimated_minutes > 0),
  content jsonb not null,
  updated_at timestamptz not null default now(),
  unique (module_id, position)
);

create table public.challenges (
  id text primary key,
  module_id text not null references public.modules (id) on delete cascade,
  lesson_id text references public.lessons (id) on delete set null,
  kind text not null check (kind in ('coding', 'debugging', 'boss')),
  title text not null,
  difficulty text not null,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.interview_questions (
  id text primary key,
  module_id text not null references public.modules (id) on delete cascade,
  kind text not null,
  difficulty text not null,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.achievements (
  id text primary key,
  title text not null,
  requirement text not null,
  category text not null check (category in ('coding', 'debugging', 'knowledge', 'consistency', 'interview', 'production')),
  updated_at timestamptz not null default now()
);

create index lessons_module_idx on public.lessons (module_id);
create index challenges_module_idx on public.challenges (module_id);
create index challenges_lesson_idx on public.challenges (lesson_id);
create index interview_questions_module_idx on public.interview_questions (module_id);

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  daily_minutes smallint not null default 30 check (daily_minutes in (15, 30, 60, 90)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create a profile row for every new auth user.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Private learning records
-- ---------------------------------------------------------------------------

-- Append-only evidence: every answered check, challenge run, interview answer,
-- bug hunt, incident and revision review. Mastery is derived from these rows.
create table public.attempts (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('check', 'challenge', 'interview', 'bug-hunt', 'incident', 'revision')),
  item_id text not null check (char_length(item_id) between 1 and 200),
  lesson_id text,
  module_id text,
  dimension text not null check (dimension in ('conceptual', 'coding', 'debugging', 'runtime', 'interview', 'retention')),
  correct boolean not null,
  score real not null check (score between 0 and 1),
  hints_used smallint not null default 0 check (hints_used between 0 and 100),
  verified boolean not null,
  attempted_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index attempts_user_time_idx on public.attempts (user_id, attempted_at);
create index attempts_user_item_idx on public.attempts (user_id, item_type, item_id);

create table public.revision_cards (
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id text not null check (char_length(card_id) between 1 and 300),
  source jsonb not null check (source ? 'kind' and source ? 'lessonId'),
  ease real not null check (ease between 1.3 and 5),
  interval_days real not null check (interval_days >= 0),
  repetitions integer not null default 0 check (repetitions >= 0),
  lapses integer not null default 0 check (lapses >= 0),
  due_at timestamptz not null,
  created_at timestamptz not null,
  last_reviewed_at timestamptz,
  last_grade text check (last_grade in ('again', 'hard', 'good', 'easy')),
  primary key (user_id, card_id)
);

create index revision_cards_due_idx on public.revision_cards (user_id, due_at);

create table public.bookmarks (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  body text not null check (char_length(body) <= 20000),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Projects are self-reported: completing a milestone never awards XP.
create table public.user_project_milestones (
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id text not null,
  milestone_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, project_id, milestone_id)
);

create table public.interview_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_ids text[] not null check (cardinality(question_ids) between 1 and 50),
  timed boolean not null default false,
  scores jsonb not null default '{}',
  started_at timestamptz not null,
  finished_at timestamptz,
  check (finished_at is null or finished_at >= started_at)
);

create index interview_sessions_user_idx on public.interview_sessions (user_id, started_at desc);

-- Derived snapshots for reporting. Clients recompute these from attempts and
-- never trust the stored values for unlocking anything.
create table public.mastery_records (
  user_id uuid not null references auth.users (id) on delete cascade,
  scope text not null check (scope in ('overall', 'module', 'dimension', 'lesson')),
  scope_id text not null,
  value real not null check (value between 0 and 1),
  updated_at timestamptz not null default now(),
  primary key (user_id, scope, scope_id)
);

create table public.learning_streaks (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= current_streak),
  updated_at timestamptz not null default now()
);

create table public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.challenges enable row level security;
alter table public.interview_questions enable row level security;
alter table public.achievements enable row level security;

-- Content is public and read-only through the API; only the service role
-- (which bypasses RLS) can change it.
create policy "content is readable by everyone" on public.modules for select to anon, authenticated using (true);
create policy "content is readable by everyone" on public.lessons for select to anon, authenticated using (true);
create policy "content is readable by everyone" on public.challenges for select to anon, authenticated using (true);
create policy "content is readable by everyone" on public.interview_questions for select to anon, authenticated using (true);
create policy "content is readable by everyone" on public.achievements for select to anon, authenticated using (true);

alter table public.profiles enable row level security;
create policy "users read their profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "users update their profile" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Attempts are append-only evidence: insert and read, delete for data removal,
-- but no updates (a learner cannot rewrite a past result).
alter table public.attempts enable row level security;
create policy "users read their attempts" on public.attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy "users add their attempts" on public.attempts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users delete their attempts" on public.attempts for delete to authenticated using ((select auth.uid()) = user_id);

-- The remaining private tables: full ownership of one's own rows.
do $$
declare
  t text;
begin
  foreach t in array array[
    'revision_cards', 'bookmarks', 'notes', 'user_project_milestones',
    'interview_sessions', 'mastery_records', 'learning_streaks', 'user_achievements'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "users read own rows" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('create policy "users insert own rows" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "users update own rows" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "users delete own rows" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end;
$$;

-- Anonymous visitors have no access to private tables at all.
revoke all on public.profiles, public.attempts, public.revision_cards, public.bookmarks, public.notes,
  public.user_project_milestones, public.interview_sessions, public.mastery_records,
  public.learning_streaks, public.user_achievements from anon;

-- Content tables are read-only for API roles even if a policy is added later by mistake.
revoke insert, update, delete, truncate on public.modules, public.lessons, public.challenges,
  public.interview_questions, public.achievements from anon, authenticated;

-- Profiles are created by the trigger; users cannot insert or delete them directly.
revoke insert, delete on public.profiles from authenticated;
