-- Admin role tests. Run after rls_test.sql (which creates alice and bob).
\set alice '00000000-0000-0000-0000-00000000000a'
\set bob   '00000000-0000-0000-0000-00000000000b'
\set carol '00000000-0000-0000-0000-00000000000c'

insert into auth.users (id, email, raw_user_meta_data) values (:'carol', 'carol@example.com', '{"display_name": "  Carol  "}');
do $$ begin
  if (select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000c') <> 'Carol' then
    raise exception 'display name from sign-up metadata not stored';
  end if;
end $$;

-- A regular user is refused every admin function and cannot make themselves admin.
set role authenticated;
select set_config('request.jwt.claim.sub', :'bob', false);
do $$ begin
  if public.is_admin() then raise exception 'bob is admin by default'; end if;
  perform public.admin_overview();
  raise exception 'non-admin could read the overview';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  perform * from public.admin_list_users();
  raise exception 'non-admin could list users';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  perform public.admin_set_admin('00000000-0000-0000-0000-00000000000b', true);
  raise exception 'non-admin could grant admin';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  insert into public.admin_users (user_id) values ('00000000-0000-0000-0000-00000000000b');
  raise exception 'user inserted into admin_users';
exception when insufficient_privilege then null;
end $$;

-- Anonymous callers cannot even execute the functions.
reset role;
set role anon;
do $$ begin
  perform public.admin_overview();
  raise exception 'anon could call admin_overview';
exception when insufficient_privilege then null;
end $$;

-- Bootstrap the first admin with a privileged connection.
reset role;
insert into public.admin_users (user_id) values (:'alice');

set role authenticated;
select set_config('request.jwt.claim.sub', :'alice', false);
do $$ declare o jsonb; n int; begin
  if not public.is_admin() then raise exception 'alice should be admin'; end if;
  o := public.admin_overview();
  if (o ->> 'total_users')::int <> 3 then raise exception 'overview total_users wrong: %', o; end if;
  if (o ->> 'total_attempts')::int < 1 then raise exception 'overview attempts wrong: %', o; end if;
  select count(*) into n from public.admin_daily_activity(14);
  if n <> 14 then raise exception 'daily activity should return 14 days, got %', n; end if;
  select count(*) into n from public.admin_list_users('carol');
  if n <> 1 then raise exception 'user search failed'; end if;
  select count(*) into n from public.admin_item_stats(1, 10);
  if n < 1 then raise exception 'item stats empty'; end if;
  perform * from public.admin_module_stats();
  -- Admins still cannot read other learners' private rows directly.
  if exists (select from public.attempts where user_id <> '00000000-0000-0000-0000-00000000000a') then
    raise exception 'admin can read other users attempts directly';
  end if;
end $$;

do $$ begin
  perform public.admin_set_admin('00000000-0000-0000-0000-00000000000a', false);
  raise exception 'admin removed their own access';
exception when invalid_parameter_value then null;
end $$;

select public.admin_set_admin(:'carol', true);
do $$ begin
  if not (select is_admin from public.admin_list_users('carol')) then raise exception 'grant failed'; end if;
end $$;
select public.admin_set_admin(:'carol', false);
do $$ begin
  if (select is_admin from public.admin_list_users('carol')) then raise exception 'revoke failed'; end if;
end $$;

reset role;
select 'Admin tests passed' as result;
