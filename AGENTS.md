<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Local dev: use the local Supabase stack, not production

`.env.local` points at a local Supabase stack running in Docker — not production. This is
deliberate: it's the sandbox for `npm run dev` and `npm run start`, so testing and iterating
never touches real user data. Vercel Preview deployments still share production's database for
now (a known, separate gap) — this only covers local machine testing.

- Start it: `npx supabase start` (requires Docker Desktop running). Prints local URLs/keys —
  already wired into `.env.local`, no need to re-copy them unless the stack is reset.
- Stop it: `npx supabase stop` (data persists in a Docker volume across stop/start).
- Studio UI (browse tables, run SQL): http://127.0.0.1:54323
- Real production credentials are backed up in `.env.prod-backup` (gitignored, not
  auto-loaded by Next.js). Only copy them into `.env.local` temporarily if you specifically
  need to test against real prod data locally — swap back afterward.
- Schema lives only in `scripts/*.sql` for anything built after this convention started, but a
  few foundational tables (`verses`, `journal_entries`, `book_notes`, `cross_refs`, `glossary`)
  predate it and aren't captured in any script. If the local stack ever needs to be rebuilt from
  scratch, replay `scripts/*.sql` in the order shown by
  `git log --diff-filter=A --name-only -- 'scripts/*schema*.sql'`, then use
  `npx supabase db dump --db-url "<prod-connection-string>" --schema public -f dump.sql`
  against production for full fidelity (never run this dump automatically — always ask the user
  to run it themselves in their own terminal, since it requires the production database
  password, which should never pass through an AI conversation).
- After schema changes: local Supabase disables anonymous sign-ins by default
  (`enable_anonymous_sign_ins` in `supabase/config.toml`) even though production has them
  enabled — already fixed in this repo's config, but worth knowing if the stack is ever
  reinitialized from scratch.
- Seed content (Bible text, commentary, plans) via the existing `npm run seed:*` / `npm run
  import:*` scripts — they all read `.env.local`, so they'll populate whatever stack it's
  currently pointed at.

## RLS / permission tests

`npm test` runs an integration suite (`tests/rls/*.test.ts`, via Vitest) that exercises every
non-trivial Row Level Security policy directly — creating real synthetic users against the
local stack and asserting who can and can't see/write what: table membership boundaries,
prayer requests, verse discussion locking, journal-entry sharing, plan-progress sharing, and
the fully-anonymous baseline. `tests/setup.ts` refuses to run unless `.env.local` points at a
local address, so this can never run destructively against production.

Run these after any change to a schema script or an RLS policy, before shipping. New
policies/tables should get a corresponding test — see `tests/helpers.ts` for the
`createTestUser` / `cleanupUser` / `adminClient` / `anonClient` fixtures.
