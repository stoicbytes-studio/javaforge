# Deploying JavaForge (Vercel + Supabase)

Result: a public website at your own URL, with accounts, progress sync and an
admin dashboard. Real Java execution is a separate optional step (part 5).
Budget about 30 minutes. Both services have free tiers.

## 1. Create the Supabase project

1. Sign in at https://supabase.com and click **New project**. Pick a name,
   a strong database password (save it) and the region closest to your users.
2. When it finishes provisioning, open **Project Settings → API** and copy:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon public** key
   Do **not** copy the `service_role` key into the app or Vercel. It bypasses
   all security rules.

## 2. Create the database

Option A, SQL editor (no tools needed): open **SQL Editor**, and run the
contents of these files in order, one at a time:

1. `supabase/migrations/20261019000000_initial_schema.sql`
2. `supabase/migrations/20261020000000_admin.sql`

Option B, Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>   # the xxxx in the URL
npx supabase db push
```

The curriculum ships inside the app, so seeding is optional. To mirror it into
the public tables anyway: `npm run seed:generate`, then run `supabase/seed.sql`
in the SQL editor.

## 3. Configure sign-in

In **Authentication**:

- **Providers → Email**: enabled, **Confirm email** on.
- **URL Configuration**: set **Site URL** to your final web address (you get it
  in step 4; come back and update it), and add these **Redirect URLs**:
  - `https://<your-domain>/sign-in`
  - `https://<your-domain>/reset-password`
  - `javaforge://sign-in` and `javaforge://reset-password` (for the mobile apps)
  - for Vercel preview deployments: `https://*-<your-team>.vercel.app/**`
- **SMTP Settings**: the built-in email sender allows only a few emails an hour.
  Before inviting people, add a provider (Resend, Postmark, SES, ...) so
  confirmation and reset emails are delivered.

## 4. Deploy the website on Vercel

1. Push this repository to GitHub (it already is) and sign in at
   https://vercel.com with GitHub.
2. **Add New → Project**, import the repo, and choose the branch you deploy
   from (merge `claude/javaforge-foundation` into `main` first, or set that
   branch as the Production Branch under Settings → Git).
3. Vercel reads `vercel.json`, so the build settings are already correct
   (install `npm ci`, build `npm run export:web`, output `dist`). Leave the
   framework preset as **Other**.
4. Under **Environment Variables** add, for Production and Preview:

   | Name | Value |
   | --- | --- |
   | `EXPO_PUBLIC_SUPABASE_URL` | your Project URL |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |
   | `EXPO_PUBLIC_EXECUTOR_URL` | leave empty until part 5 |

   These values are baked into the site at build time, so **redeploy after
   changing them**. They are public by design; only the anon key belongs here.
5. Click **Deploy**. When it finishes, open the URL. Go back to Supabase step 3
   and set the Site URL and Redirect URLs to this address.
6. Optional: **Settings → Domains** to attach your own domain; update the
   Supabase URLs again.

## 5. Real Java execution (optional, recommended)

Vercel cannot run the execution service: it needs Docker and a long-lived
process. Without it the playground uses simulation mode, labelled on screen,
and coding results count as unverified. To enable real execution:

1. Create a small Linux VM (2 vCPU / 2-4 GB RAM is enough to start) on any
   cloud provider, with Docker installed. Use a machine dedicated to this; do
   not share it with anything holding secrets.
2. Build and run the service (see `docs/execution-api.md` for details):
   ```bash
   cd executor
   docker build -t javaforge-executor .
   docker pull eclipse-temurin:21-jdk
   docker run -d --restart unless-stopped --name executor -p 8080:8080 \
     -v /var/run/docker.sock:/var/run/docker.sock \
     -e EXECUTOR_ALLOWED_ORIGINS=https://<your-domain> \
     javaforge-executor
   ```
   Mounting the Docker socket gives the API control of the host's Docker, which
   is why the VM must be dedicated. Prefer rootless Docker or gVisor when you
   can.
3. Put HTTPS in front (Caddy or nginx with a Let's Encrypt certificate, or a
   Cloudflare tunnel), e.g. `https://run.<your-domain>`. Browsers block an
   HTTPS site from calling a plain-HTTP API.
4. In Vercel, set `EXPO_PUBLIC_EXECUTOR_URL=https://run.<your-domain>` and
   redeploy.
5. Check: `curl https://run.<your-domain>/api/v1/health` returns `"status":"UP"`,
   then run a challenge on the site and confirm the banner no longer says
   "simulation".

## 6. Make yourself admin

1. Open your site, **Sign in → Create an account**, and confirm the email.
2. In Supabase **SQL Editor** run (use your own email):
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
3. Reload the site. **Admin** appears in the sidebar (and under More on phones).
   More admins can be added from **Admin → Learners**.

## 7. Launch checklist

- [ ] Sign up, confirm email, sign in, sign out, reset password: all work
- [ ] Answer a lesson check on one device, see it on another after sign-in
- [ ] Supabase **Authentication → Rate Limits** reviewed
- [ ] Custom SMTP configured
- [ ] Supabase database backups on (Pro plan) if you hold real learner data
- [ ] Privacy policy and terms linked, since you store emails and learning data
- [ ] `service_role` key appears nowhere in Vercel env vars or the repo
- [ ] Executor rate limits and `EXECUTOR_ALLOWED_ORIGINS` set (if used)

## Troubleshooting

- **No "Sign in" button on the site**: the two Supabase variables were missing
  at build time. Add them in Vercel and redeploy.
- **Confirmation or reset link goes to the wrong place**: fix Site URL and
  Redirect URLs in Supabase.
- **Refreshing a page gives 404**: the rewrite in `vercel.json` handles this;
  make sure the file is deployed unchanged.
- **Admin menu missing**: the SQL insert matched no row (email typo or
  unconfirmed account); run `select * from public.admin_users;`.
- **Code runs but says simulation**: `EXPO_PUBLIC_EXECUTOR_URL` was empty at
  build time, or the health check fails (CORS origin, HTTPS, firewall port).
