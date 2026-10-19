-- RLS behaviour tests. Run after supabase_stub.sql and the migrations:
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/rls_test.sql
-- Every block raises an exception if an expectation fails.
\set alice '00000000-0000-0000-0000-00000000000a'
\set bob   '00000000-0000-0000-0000-00000000000b'

insert into auth.users (id, email) values (:'alice', 'alice@example.com'), (:'bob', 'bob@example.com');
insert into public.modules (id, position, title, short_title, summary, level, content)
  values ('fundamentals', 1, 'Fundamentals', 'Fundamentals', 'Basics', 'core', '{}')
  on conflict (id) do nothing;

do $$ begin
  if (select count(*) from public.profiles) <> 2 then raise exception 'profiles not created by trigger'; end if;
end $$;

-- Alice writes her own records.
set role authenticated;
select set_config('request.jwt.claim.sub', :'alice', false);
insert into public.attempts (id, user_id, item_type, item_id, dimension, correct, score, hints_used, verified, attempted_at)
  values (gen_random_uuid(), :'alice', 'check', 'f1-c1', 'conceptual', true, 1, 0, true, now());
insert into public.notes (user_id, lesson_id, body) values (:'alice', 'f-first-program', 'my note');
insert into public.bookmarks (user_id, lesson_id) values (:'alice', 'f-first-program');

-- Alice cannot write rows for Bob.
do $$ begin
  insert into public.notes (user_id, lesson_id, body) values ('00000000-0000-0000-0000-00000000000b', 'x', 'forged');
  raise exception 'insert for another user was allowed';
exception when insufficient_privilege then null;
end $$;

-- Attempts are append-only.
do $$ declare n int; begin
  update public.attempts set score = 0.1;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'attempt update was allowed'; end if;
exception when insufficient_privilege then null;
end $$;

-- Constraints reject impossible values.
do $$ begin
  insert into public.attempts (id, user_id, item_type, item_id, dimension, correct, score, hints_used, verified, attempted_at)
    values (gen_random_uuid(), '00000000-0000-0000-0000-00000000000a', 'check', 'x', 'conceptual', true, 1.5, 0, true, now());
  raise exception 'score above 1 was accepted';
exception when check_violation then null;
end $$;

-- Content is read-only for API roles.
do $$ begin
  update public.modules set title = 'hacked';
  raise exception 'content update was allowed';
exception when insufficient_privilege then null;
end $$;

-- Bob sees none of Alice's rows and cannot change them.
select set_config('request.jwt.claim.sub', :'bob', false);
do $$ declare n int; begin
  if (select count(*) from public.attempts) <> 0 then raise exception 'bob can read alice attempts'; end if;
  if (select count(*) from public.notes) <> 0 then raise exception 'bob can read alice notes'; end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'bob sees other profiles'; end if;
  delete from public.notes;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'bob deleted alice notes'; end if;
  if not exists (select from public.modules) then raise exception 'content not readable'; end if;
end $$;

-- Anonymous visitors can read content but not private tables.
reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$ begin
  if not exists (select from public.modules) then raise exception 'anon cannot read content'; end if;
  perform 1 from public.attempts;
  raise exception 'anon can query attempts';
exception when insufficient_privilege then null;
end $$;

reset role;
do $$ begin
  if (select count(*) from public.notes) <> 1 then raise exception 'alice note missing'; end if;
end $$;
select 'RLS tests passed' as result;
