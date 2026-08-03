-- Moves reading plans from hardcoded TypeScript into the database, and adds a
-- devotional-text + reflection-prompt layer per day that didn't exist before.
-- plan_progress (existing) is untouched — day_index keeps the same 0-based meaning.
--
-- Run once in the Supabase SQL editor.

create table if not exists public.plans (
  id text primary key,
  title text not null,
  blurb text not null,
  category text not null,
  tags text[] not null default '{}',
  total_days int not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.plan_days (
  id bigint generated always as identity primary key,
  plan_id text not null references public.plans(id) on delete cascade,
  day_index int not null,
  label text not null,
  book text not null,
  chapter int not null,
  devotional text,
  reflection_prompt text,
  unique (plan_id, day_index)
);

create index if not exists plan_days_by_plan on public.plan_days (plan_id, day_index);

alter table public.plans enable row level security;
alter table public.plan_days enable row level security;
create policy "plans are public" on public.plans for select using (true);
create policy "plan days are public" on public.plan_days for select using (true);

grant select on public.plans, public.plan_days to anon, authenticated;
grant select, insert, update, delete on public.plans, public.plan_days to service_role;
grant usage, select on all sequences in schema public to service_role;
