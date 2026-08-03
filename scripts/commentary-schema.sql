-- Upgrades cross_refs from chapter-level (hand-curated, ~60 chapters) to verse-level,
-- backed by the Treasury of Scripture Knowledge (public domain, ~382,000 references).
-- The old chapter-level rows are superseded, not merged — TSK covers every verse.
--
-- Run once in the Supabase SQL editor.

drop table if exists public.cross_refs;

create table public.cross_refs (
  id bigint generated always as identity primary key,
  book text not null,
  chapter int not null,
  verse int not null,
  refs text not null,
  unique (book, chapter, verse)
);

create index cross_refs_lookup on public.cross_refs (book, chapter, verse);

alter table public.cross_refs enable row level security;
create policy "refs are public" on public.cross_refs for select using (true);

grant select on public.cross_refs to anon, authenticated;
grant select, insert, update, delete on public.cross_refs to service_role;
grant usage, select on all sequences in schema public to service_role;
