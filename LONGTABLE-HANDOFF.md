# Longtable — Production Handoff

This document briefs Claude Code (or any developer) on turning the Longtable prototype
(`longtable-app.jsx`, in this repo) into a production web app.

## 1. What Longtable is

A **non-profit Bible study platform** whose mission is that everyone — of any denomination,
any faith background, or none — feels welcome learning about the Bible.

Non-negotiable product principles:

- Scripture and core study tools are free. No ads. Donations sustain the project.
- The AI Study Companion is a **study tool, not a spiritual authority**. It explains what the
  text says, gives historical/cultural context, and describes how major traditions interpret
  contested passages — fairly, by name, without declaring a winner. It never proselytizes or
  condemns, and it points personal/pastoral questions back to the person's own community.
- AI answers are **grounded**: real scripture text and reference sources are retrieved and
  passed to the model, answers cite them ([S1], [S2]), and a "Sources consulted" panel is shown.
- Everything in the prototype's system prompts (COMPANION_SYSTEM, GUIDE_SYSTEM) carries over
  verbatim as the baseline; refine only with care.

## 2. What the prototype already contains (port all of it)

- **Today**: daily verse (deterministic by date) + resume-your-plan cards
- **Read**: all 66 books, chapter navigation, 3 public-domain translations (WEB/KJV/ASV),
  tap-a-verse actions: highlight (3 colors), per-verse note, ask the Companion
- **Plans**: 4 reading plans with per-day completion tracking and progress bars
- **Companion**: grounded chat (reference detection → fetch chapter text → attach book
  background, cross-references, glossary → cite sources)
- **Study Guide**: generator for small-group discussion guides
- **Journal**: collected highlights/verse notes + free-form entries
- Visual identity: "lamplit reading room" — palette and fonts are in the prototype file.
  Keep it.

## 3. Target architecture

- **Next.js 14+ (App Router)** deployed on **Vercel**
- **Supabase**: Postgres + Auth (email magic link + Google)
- **Anthropic API** called ONLY from server routes (never expose the key client-side)
- **Scripture self-hosted** in Postgres (WEB/KJV/ASV are public domain; import once from a
  public-domain dataset, e.g. the open bible-api / scrollmapper datasets)

```
app/
  page.tsx                    # Today
  read/page.tsx               # Reader
  plans/page.tsx              # Plans
  companion/page.tsx          # Companion chat
  guide/page.tsx              # Study guide generator
  journal/page.tsx            # Journal
  api/companion/route.ts      # server → Anthropic (grounded pipeline)
  api/guide/route.ts          # server → Anthropic
lib/
  supabase.ts, anthropic.ts, sources.ts (retrieval pipeline from prototype)
```

## 4. Database schema (run in Supabase SQL editor)

```sql
-- Scripture (imported once per translation)
create table verses (
  id bigint generated always as identity primary key,
  translation text not null,          -- 'web' | 'kjv' | 'asv'
  book text not null,
  chapter int not null,
  verse int not null,
  text text not null
);
create index verses_lookup on verses (translation, book, chapter);

-- Reference library
create table book_notes ( book text primary key, note text not null );
create table cross_refs ( book text, chapter int, refs text, primary key (book, chapter) );
create table glossary   ( term text primary key, entry text not null );

-- User data (all rows owned by a user)
create table marks (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users not null,
  book text not null, chapter int not null, verse int not null,
  color text,                          -- 'gold' | 'green' | 'rose' | null
  note text,
  verse_text text,                     -- snapshot for display in Journal
  created_at timestamptz default now(),
  unique (user_id, book, chapter, verse)
);

create table journal_entries (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users not null,
  text text not null,
  created_at timestamptz default now()
);

create table plan_progress (
  user_id uuid references auth.users not null,
  plan_id text not null,
  day_index int not null,
  completed_at timestamptz default now(),
  primary key (user_id, plan_id, day_index)
);

-- AI usage caps (abuse/cost protection)
create table ai_usage (
  user_id uuid references auth.users not null,
  day date not null default current_date,
  count int not null default 0,
  primary key (user_id, day)
);

-- Row Level Security: users only see their own rows
alter table marks enable row level security;
alter table journal_entries enable row level security;
alter table plan_progress enable row level security;
alter table ai_usage enable row level security;

create policy "own marks" on marks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own journal" on journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress" on plan_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own usage" on ai_usage
  for select using (auth.uid() = user_id);

-- Public read for scripture + reference tables
alter table verses enable row level security;
create policy "verses are public" on verses for select using (true);
alter table book_notes enable row level security;
create policy "notes are public" on book_notes for select using (true);
alter table cross_refs enable row level security;
create policy "refs are public" on cross_refs for select using (true);
alter table glossary enable row level security;
create policy "glossary is public" on glossary for select using (true);
```

## 5. Secure Companion route (shape)

`app/api/companion/route.ts` — the only place the Anthropic key is used:

```ts
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const DAILY_LIMIT = 20;

export async function POST(req: Request) {
  // 1. Authenticate the user via Supabase (reject if signed out)
  // 2. Check + increment ai_usage for today; 429 if over DAILY_LIMIT
  // 3. Run the grounding pipeline (port gatherSources from the prototype,
  //    but query the verses/book_notes/cross_refs/glossary tables instead
  //    of fetching bible-api.com)
  // 4. Call Anthropic with COMPANION_SYSTEM + sources block
  //    - use prompt caching on the static system prompt to cut input cost ~90%
  //    - model: start with claude-sonnet-latest for quality; consider routing
  //      simple glossary questions to haiku
  // 5. Return { reply, sources } — never the raw API response or key
}
```

Environment variables (set in Vercel + a local `.env.local`, never committed):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only
ANTHROPIC_API_KEY=                # server only
```

## 6. Build checklist (suggested order)

1. `npx create-next-app@latest longtable` (TypeScript, Tailwind, App Router)
2. Port the prototype components into pages; keep visual identity
3. Supabase project + run schema above; wire auth (email magic link, Google)
4. Import WEB/KJV/ASV verse datasets into `verses`; seed book_notes / cross_refs /
   glossary from the prototype's data (expand over time with full public-domain works:
   Matthew Henry, Treasury of Scripture Knowledge, Easton's)
5. Build `/api/companion` and `/api/guide` with auth + daily caps + prompt caching
6. Replace prototype localStorage-style persistence with Supabase queries
7. Deploy to Vercel; set env vars; verify auth flow works on the live URL
8. Add donation link (Ko-fi / Stripe / Donorbox) in footer
9. Private beta with 10–20 people across different traditions; iterate
10. Custom domain, then public launch

## 7. Roadmap after launch (from the project plan)

- Phase 3: groups — shared plans, discussion, prayer requests (new tables: groups,
  group_members, group_posts; same RLS pattern)
- Expanded reference corpus with full-text search (Postgres FTS or pgvector)
- More translations via API.Bible (licensed: NIV/ESV etc.) when budget allows
- Mobile apps (React Native / Expo) reusing the same Supabase + API routes
- Advisory circle of reviewers from multiple traditions for AI output review
