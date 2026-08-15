-- Verse-by-verse classic commentary (Matthew Henry, Jamieson-Fausset-Brown, Barnes' —
-- all public domain, extracted from CrossWire SWORD modules). Separate from
-- book_notes/glossary since this is historical primary-source material in its
-- original authors' voices, not Longtable's own neutral-voice content, and multiple
-- commentaries can exist per verse, each attributed to its source.
--
-- Run once in the Supabase SQL editor.

create table if not exists public.commentary (
  id bigint generated always as identity primary key,
  book text not null,
  chapter int not null,
  verse int not null,
  source text not null,
  text text not null,
  unique (book, chapter, verse, source)
);

create index if not exists commentary_lookup on public.commentary (book, chapter, verse);

alter table public.commentary enable row level security;
create policy "commentary is public" on public.commentary for select using (true);

grant select on public.commentary to anon, authenticated;
grant select, insert, update, delete on public.commentary to service_role;
grant usage, select on all sequences in schema public to service_role;
