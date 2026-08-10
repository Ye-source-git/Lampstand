-- Phase 2 of Tables: a prayer wall. Any member can post a request; others
-- tap "praying for this" as a presence indicator rather than replying with
-- text — deliberately not a comment thread, since that's where doctrinal
-- disagreement tends to creep in and this space isn't meant for that. The
-- author can mark their own request answered; the table owner can remove
-- any request (same moderation shape as removing a member).
-- Run once in the Supabase SQL editor, after tables-schema.sql and
-- tables-rls-fix.sql.

create table if not exists public.prayer_requests (
  id bigint generated always as identity primary key,
  table_id bigint not null references public.tables(id) on delete cascade,
  user_id uuid not null,
  text text not null,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create table if not exists public.prayer_acknowledgments (
  prayer_id bigint not null references public.prayer_requests(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (prayer_id, user_id)
);

create index if not exists prayer_requests_by_table on public.prayer_requests (table_id, created_at desc);

alter table public.prayer_requests enable row level security;
alter table public.prayer_acknowledgments enable row level security;

create policy "prayer requests visible to table members" on public.prayer_requests
  for select using (public.is_table_member(table_id));

create policy "members can post a prayer request" on public.prayer_requests
  for insert with check (user_id = auth.uid() and public.is_table_member(table_id));

create policy "author can update their own prayer request" on public.prayer_requests
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "author or owner can remove a prayer request" on public.prayer_requests
  for delete using (user_id = auth.uid() or public.is_table_owner(table_id));

-- Acknowledgments ("praying for this") aren't self-referencing, so this is a
-- plain subquery rather than needing another security-definer function —
-- the recursion problem earlier was specifically a table's RLS policy
-- querying itself.
create policy "acknowledgments visible to table members" on public.prayer_acknowledgments
  for select using (
    exists (select 1 from public.prayer_requests pr where pr.id = prayer_acknowledgments.prayer_id and public.is_table_member(pr.table_id))
  );

create policy "members can say they're praying" on public.prayer_acknowledgments
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.prayer_requests pr where pr.id = prayer_acknowledgments.prayer_id and public.is_table_member(pr.table_id))
  );

create policy "members can un-mark praying" on public.prayer_acknowledgments
  for delete using (user_id = auth.uid());

grant select, insert, update, delete on public.prayer_requests to authenticated;
grant select, insert, delete on public.prayer_acknowledgments to authenticated;
grant select, insert, update, delete on public.prayer_requests, public.prayer_acknowledgments to service_role;
grant usage, select on all sequences in schema public to service_role;
