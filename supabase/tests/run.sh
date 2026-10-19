#!/usr/bin/env bash
# Applies the migrations and the generated seed to a scratch database and runs
# the RLS and admin tests. Needs a Postgres superuser connection, e.g.
#   docker run -d --name jf-pg -e POSTGRES_PASSWORD=pg -p 55432:5432 postgres:17
#   PGURL=postgres://postgres:pg@localhost:55432 npm run test:db
set -euo pipefail
cd "$(dirname "$0")/../.."
: "${PGURL:?set PGURL to a superuser connection string, e.g. postgres://postgres:pg@localhost:55432}"
db=javaforge_test
psql "$PGURL/postgres" -v ON_ERROR_STOP=1 -q -c "drop database if exists $db" -c "create database $db"
run() { psql "$PGURL/$db" -v ON_ERROR_STOP=1 -q -f "$1" > /dev/null; }
run supabase/tests/supabase_stub.sql
for f in supabase/migrations/*.sql; do run "$f"; done
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/generate-seed.mjs > /dev/null
run supabase/seed.sql
run supabase/seed.sql   # seeding must be repeatable
psql "$PGURL/$db" -v ON_ERROR_STOP=1 -q -f supabase/tests/rls_test.sql | grep -q 'RLS tests passed'
psql "$PGURL/$db" -v ON_ERROR_STOP=1 -q -f supabase/tests/admin_test.sql | grep -q 'Admin tests passed'
echo "Migrations, seed, RLS and admin tests passed."
