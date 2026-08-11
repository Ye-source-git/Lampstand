-- Phase 4 of Tables: verse discussion, scoped strictly to a table — never
-- global or public. Deliberately flat (no nested replies) and with no
-- voting/reactions, since both of those are where disagreement tends to
-- entrench or turn into a popularity contest. The table owner can delete
-- any comment or lock discussion on a specific verse (stops new comments
-- without erasing history); an author can delete their own comment.
-- Run once in the Supabase SQL editor, after tables-schema.sql and
-- tables-rls-fix.sql.

create table if not exists public.verse_discussions (
  id bigint generated always as identity primary key,
  table_id bigint not null references public.tables(id) on delete cascade,
  book text not null,
  chapter int not null,
  verse int not null,
  user_id uuid not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.verse_discussion_locks (
  table_id bigint not null references public.tables(id) on delete cascade,
  book text not null,
  chapter int not null,
  verse int not null,
  locked_by uuid not null,
  locked_at timestamptz not null default now(),
  primary key (table_id, book, chapter, verse)
);

create index if not exists verse_discussions_by_location on public.verse_discussions (table_id, book, chapter, verse, created_at);

alter table public.verse_discussions enable row level security;
alter table public.verse_discussion_locks enable row level security;

create policy "verse discussions visible to table members" on public.verse_discussions
  for select using (public.is_table_member(table_id));

create policy "members can post to unlocked verse discussions" on public.verse_discussions
  for insert with check (
    user_id = auth.uid()
    and public.is_table_member(table_id)
    and not exists (
      select 1 from public.verse_discussion_locks l
      where l.table_id = verse_discussions.table_id
        and l.book = verse_discussions.book
        and l.chapter = verse_discussions.chapter
        and l.verse = verse_discussions.verse
    )
  );

create policy "author or owner can remove a discussion comment" on public.verse_discussions
  for delete using (user_id = auth.uid() or public.is_table_owner(table_id));

create policy "locks visible to table members" on public.verse_discussion_locks
  for select using (public.is_table_member(table_id));

create policy "owners can lock a verse discussion" on public.verse_discussion_locks
  for insert with check (public.is_table_owner(table_id));

create policy "owners can unlock a verse discussion" on public.verse_discussion_locks
  for delete using (public.is_table_owner(table_id));

grant select, insert, delete on public.verse_discussions, public.verse_discussion_locks to authenticated;
grant select, insert, update, delete on public.verse_discussions, public.verse_discussion_locks to service_role;
grant usage, select on all sequences in schema public to service_role;
