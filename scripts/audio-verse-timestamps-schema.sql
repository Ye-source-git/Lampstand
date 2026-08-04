-- Per-verse audio timestamps, so "play this verse" can seek into the existing
-- chapter/multi-chapter audio file instead of always starting at 0:00.
-- Populated by an offline forced-alignment pipeline (scripts/align-audio.py),
-- not hand-entered — coverage will start with a subset and expand over time.
-- Run once in the Supabase SQL editor.

create table if not exists public.audio_verse_timestamps (
  id bigint generated always as identity primary key,
  audio_track_id bigint not null references public.audio_tracks(id) on delete cascade,
  translation text not null,
  book text not null,
  chapter int not null,
  verse int not null,
  start_seconds numeric not null,
  end_seconds numeric not null,
  unique (translation, book, chapter, verse)
);

create index if not exists audio_verse_timestamps_lookup
  on public.audio_verse_timestamps (translation, book, chapter, verse);

alter table public.audio_verse_timestamps enable row level security;

create policy "audio verse timestamps are public" on public.audio_verse_timestamps for select using (true);

grant select on public.audio_verse_timestamps to anon, authenticated;
grant select, insert, update, delete on public.audio_verse_timestamps to service_role;
grant usage, select on all sequences in schema public to service_role;
