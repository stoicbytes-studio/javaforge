# Accounts and the admin dashboard

## Accounts

Sign-in, sign-up, password reset and email confirmation use Supabase Auth
(email and password). Screens: `/sign-in`, `/sign-up`, `/forgot-password`,
`/reset-password`. Without Supabase configured, the app runs local-only and
these screens explain how to enable accounts.

Supabase project settings to check:

- **Authentication → URL configuration**: set the Site URL to your web origin
  and add redirect URLs for `https://<your-domain>/sign-in`,
  `https://<your-domain>/reset-password`, and the app's deep links
  (`javaforge://sign-in`, `javaforge://reset-password`).
- **Authentication → Providers → Email**: keep "Confirm email" on.
- Configure custom SMTP before launch; the built-in sender is rate limited.

## Admins

Admin rights are rows in `public.admin_users`. The API cannot write to that
table, so the first admin must be added with a privileged connection, for
example in the Supabase SQL editor after signing up in the app:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'you@example.com';
```

After that, admins can grant or remove admin access for other learners from
**Admin → Learners**. An admin cannot remove their own access, so the last
admin cannot lock everyone out by accident.

## What admins can see

The dashboard (`/admin`, in the sidebar or the More menu for admins) shows:

- **Overview**: learners, sign-ups, active learners, attempts, verified
  challenge passes, average mastery, 30-day activity charts and per-module
  correct rates.
- **Learners**: search by email or name; join date, last activity, attempt
  count, mastery and streak; grant or remove admin access.
- **Content**: the content inventory of the running app version and the items
  learners get wrong most often, linked to the lesson or challenge.

Admins never see learners' notes, code or individual answers. Everything comes
from `security definer` functions in
`supabase/migrations/20261020000000_admin.sql`; each checks `is_admin()` on the
server, so hiding the menu from non-admins is only a convenience.
`supabase/tests/admin_test.sql` covers the access rules.
