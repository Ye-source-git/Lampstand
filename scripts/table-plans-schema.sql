-- Phase 1 of Tables: reading a plan together, with a supportive collective
-- streak (consecutive days where anyone at the table read) rather than a
-- competitive leaderboard. Individual reading still happens through the
-- normal Plans page and writes to the existing plan_progress table — this
-- just lets table members see each other's progress on a plan they've
-- started together.
-- Run once in the Supabase SQL editor, after tables-schema.sql and
-- tables-rls-fix.sql.

create table if not exists public.table_plans (
  table_id bigint not null references public.tables(id) on delete cascade,
  plan_id text not null references public.plans(id) on delete cascade,
  started_by uuid not null,
  started_at timestamptz not null default now(),
  primary key (table_id, plan_id)
);

alter table public.table_plans enable row level security;

create policy "table plans visible to members" on public.table_plans
  for select using (public.is_table_member(table_id));

create policy "owners can start a shared plan" on public.table_plans
  for insert with check (public.is_table_owner(table_id));

create policy "owners can remove a shared plan" on public.table_plans
  for delete using (public.is_table_owner(table_id));

grant select, insert, delete on public.table_plans to authenticated;
grant select, insert, update, delete on public.table_plans to service_role;

-- Lets a table member see another member's plan_progress rows, but only for
-- a plan their shared table has actually started together — not their
-- progress on unrelated plans. This is an *additional* permissive select
-- policy; the original "own progress" policy (for all commands) still
-- governs insert/update/delete, so nobody can write another member's rows.
create or replace function public.shares_table_plan(target_user_id uuid, target_plan_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.table_members tm_me
    join public.table_members tm_them
      on tm_them.table_id = tm_me.table_id and tm_them.user_id = target_user_id
    join public.table_plans tp
      on tp.table_id = tm_me.table_id and tp.plan_id = target_plan_id
    where tm_me.user_id = auth.uid()
  );
$$;

grant execute on function public.shares_table_plan(uuid, text) to authenticated;

create policy "table members see shared plan progress" on public.plan_progress
  for select using (public.shares_table_plan(user_id, plan_id));
