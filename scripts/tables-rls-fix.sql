-- Fixes "infinite recursion detected in policy for relation table_members"
-- (Postgres error 42P17). The original policies checked membership via a
-- subquery on table_members from *within* a table_members policy, which
-- re-triggers the same RLS check recursively. The fix (the standard Supabase
-- pattern for this) is a security-definer helper function: it runs with the
-- privileges of its owner, so its internal query isn't subject to RLS,
-- breaking the recursion.
-- Run once in the Supabase SQL editor, after tables-schema.sql.

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

drop policy if exists "tables visible to members" on public.tables;
create policy "tables visible to members" on public.tables
  for select using (public.is_table_member(id));

drop policy if exists "owners can update their table" on public.tables;
create policy "owners can update their table" on public.tables
  for update using (public.is_table_owner(id));

drop policy if exists "owners can delete their table" on public.tables;
create policy "owners can delete their table" on public.tables
  for delete using (public.is_table_owner(id));

drop policy if exists "members visible to members" on public.table_members;
create policy "members visible to members" on public.table_members
  for select using (public.is_table_member(table_id));

drop policy if exists "leave or be removed by an owner" on public.table_members;
create policy "leave or be removed by an owner" on public.table_members
  for delete using (user_id = auth.uid() or public.is_table_owner(table_id));
