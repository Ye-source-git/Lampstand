-- Phase 0 of the Tables (community) feature: bounded, invite-only groups.
-- Deliberately not a public/discoverable space — visibility is scoped to
-- members only, and joining requires knowing the invite code (enforced by
-- routing all writes through server routes using the service role, rather
-- than an open RLS insert policy).
-- Run once in the Supabase SQL editor.

create table if not exists public.tables (
  id bigint generated always as identity primary key,
  name text not null,
  invite_code text not null unique,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.table_members (
  table_id bigint not null references public.tables(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (table_id, user_id)
);

create index if not exists table_members_by_user on public.table_members (user_id);

alter table public.tables enable row level security;
alter table public.table_members enable row level security;

-- Membership checks are wrapped in security-definer functions rather than
-- inlined as subqueries directly in the table_members policies. A policy on
-- table_members that subqueries table_members itself re-triggers its own RLS
-- check and Postgres rejects it as infinite recursion (42P17); a
-- security-definer function runs with its owner's privileges, so its
-- internal query isn't subject to RLS, which breaks the recursion.
create or replace function public.is_table_member(target_table_id bigint, target_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.table_members
    where table_id = target_table_id and user_id = target_user_id
  );
$$;

create or replace function public.is_table_owner(target_table_id bigint, target_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.table_members
    where table_id = target_table_id and user_id = target_user_id and role = 'owner'
  );
$$;

grant execute on function public.is_table_member(bigint, uuid) to authenticated;
grant execute on function public.is_table_owner(bigint, uuid) to authenticated;

-- A table is visible only to its own members.
create policy "tables visible to members" on public.tables
  for select using (public.is_table_member(id));

-- Defense-in-depth: the actual creation path is /api/tables/create (service
-- role, creates the table + owner membership together), but this lets a
-- signed-in user's own insert succeed too if ever called directly.
create policy "users can create their own table" on public.tables
  for insert with check (auth.uid() = created_by);

create policy "owners can update their table" on public.tables
  for update using (public.is_table_owner(id));

create policy "owners can delete their table" on public.tables
  for delete using (public.is_table_owner(id));

-- Members of a table can see the rest of its member list.
create policy "members visible to members" on public.table_members
  for select using (public.is_table_member(table_id));

-- No insert policy for table_members: joining always goes through
-- /api/tables/join (service role), since it requires proving knowledge of
-- the invite code first. A member can remove themselves; an owner can
-- remove anyone (moderation).
create policy "leave or be removed by an owner" on public.table_members
  for delete using (user_id = auth.uid() or public.is_table_owner(table_id));

grant select on public.tables, public.table_members to authenticated;
grant insert, update, delete on public.tables to authenticated;
grant delete on public.table_members to authenticated;
grant select, insert, update, delete on public.tables, public.table_members to service_role;
grant usage, select on all sequences in schema public to service_role;
