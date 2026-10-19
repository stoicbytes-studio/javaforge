-- Admin role and admin reporting.
--
-- Admins are listed in public.admin_users. Nobody can add themselves through
-- the API: the table has no write policies, so the first admin is granted
-- with a privileged connection (SQL editor), for example:
--
--   insert into public.admin_users (user_id)
--   select id from auth.users where email = 'you@example.com';
--
-- Admin data is exposed only through the security-definer functions below,
-- each of which checks public.is_admin() first. Admins get aggregate
-- reports and a learner list; they do not get direct access to learners'
-- private rows (notes, answers).

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users (id) on delete set null
);

alter table public.admin_users enable row level security;
-- Users may check whether they themselves are admins; nothing else.
create policy "users see their own admin row" on public.admin_users
  for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.admin_users from anon;
revoke insert, update, delete, truncate on public.admin_users from authenticated;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

create function public.assert_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;
end;
$$;

-- Store the display name chosen at sign-up on the profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 60), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reports
-- ---------------------------------------------------------------------------

create function public.admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform public.assert_admin();
  select jsonb_build_object(
    'total_users', (select count(*) from auth.users),
    'new_users_7d', (select count(*) from auth.users where created_at >= now() - interval '7 days'),
    'active_users_7d', (select count(distinct user_id) from public.attempts where attempted_at >= now() - interval '7 days'),
    'active_users_30d', (select count(distinct user_id) from public.attempts where attempted_at >= now() - interval '30 days'),
    'total_attempts', (select count(*) from public.attempts),
    'attempts_7d', (select count(*) from public.attempts where attempted_at >= now() - interval '7 days'),
    'verified_challenge_passes', (select count(*) from public.attempts where item_type = 'challenge' and correct and verified),
    'average_mastery', (select coalesce(avg(value), 0) from public.mastery_records where scope = 'overall'),
    'admins', (select count(*) from public.admin_users)
  ) into result;
  return result;
end;
$$;

create function public.admin_daily_activity(days integer default 30)
returns table (day date, signups bigint, active_users bigint, attempts bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  if days < 1 or days > 365 then
    raise exception 'days must be between 1 and 365' using errcode = '22023';
  end if;
  return query
  with span as (
    select generate_series((now() at time zone 'utc')::date - (days - 1), (now() at time zone 'utc')::date, interval '1 day')::date as d
  )
  select
    span.d,
    (select count(*) from auth.users u where (u.created_at at time zone 'utc')::date = span.d),
    (select count(distinct a.user_id) from public.attempts a where (a.attempted_at at time zone 'utc')::date = span.d),
    (select count(*) from public.attempts a where (a.attempted_at at time zone 'utc')::date = span.d)
  from span
  order by span.d;
end;
$$;

-- Content items ranked by how often learners get them wrong: the place to
-- look for confusing questions or missing teaching.
create function public.admin_item_stats(min_attempts integer default 5, max_rows integer default 50)
returns table (item_type text, item_id text, attempts bigint, learners bigint, correct_rate double precision, avg_hints double precision)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return query
  select a.item_type, a.item_id, count(*), count(distinct a.user_id),
         avg(case when a.correct then 1.0 else 0.0 end)::double precision,
         avg(a.hints_used)::double precision
  from public.attempts a
  where a.item_type <> 'revision'
  group by a.item_type, a.item_id
  having count(*) >= greatest(min_attempts, 1)
  order by 5 asc, 3 desc
  limit least(greatest(max_rows, 1), 200);
end;
$$;

create function public.admin_module_stats()
returns table (module_id text, learners bigint, attempts bigint, correct_rate double precision, avg_mastery double precision)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return query
  select a.module_id, count(distinct a.user_id), count(*),
         avg(case when a.correct then 1.0 else 0.0 end)::double precision,
         (select avg(m.value)::double precision from public.mastery_records m where m.scope = 'module' and m.scope_id = a.module_id)
  from public.attempts a
  where a.module_id is not null
  group by a.module_id
  order by a.module_id;
end;
$$;

create function public.admin_list_users(search text default null, max_rows integer default 50, skip integer default 0)
returns table (
  user_id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  last_active_at timestamptz,
  attempts bigint,
  overall_mastery double precision,
  current_streak integer,
  is_admin boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return query
  select u.id, u.email::text, p.display_name, u.created_at,
         (select max(a.attempted_at) from public.attempts a where a.user_id = u.id),
         (select count(*) from public.attempts a where a.user_id = u.id),
         (select m.value::double precision from public.mastery_records m where m.user_id = u.id and m.scope = 'overall' and m.scope_id = 'overall'),
         (select s.current_streak from public.learning_streaks s where s.user_id = u.id),
         exists (select 1 from public.admin_users au where au.user_id = u.id)
  from auth.users u
  left join public.profiles p on p.id = u.id
  where search is null or search = ''
     or u.email ilike '%' || search || '%'
     or p.display_name ilike '%' || search || '%'
  order by u.created_at desc
  limit least(greatest(max_rows, 1), 200)
  offset greatest(skip, 0);
end;
$$;

create function public.admin_set_admin(target uuid, make_admin boolean)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  if target = (select auth.uid()) and not make_admin then
    raise exception 'you cannot remove your own admin access' using errcode = '22023';
  end if;
  if make_admin then
    insert into public.admin_users (user_id, granted_by) values (target, (select auth.uid()))
    on conflict (user_id) do nothing;
  else
    delete from public.admin_users where user_id = target;
  end if;
end;
$$;

-- Functions are executable by PUBLIC by default; restrict them to signed-in users
-- (each still checks admin membership itself).
do $$
declare
  f text;
begin
  foreach f in array array[
    'public.is_admin()', 'public.assert_admin()', 'public.admin_overview()',
    'public.admin_daily_activity(integer)', 'public.admin_item_stats(integer, integer)',
    'public.admin_module_stats()', 'public.admin_list_users(text, integer, integer)',
    'public.admin_set_admin(uuid, boolean)'
  ] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
