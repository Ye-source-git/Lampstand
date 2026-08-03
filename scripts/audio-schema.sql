-- Audio Bible tracks (public-domain LibriVox recordings, streamed directly from
-- archive.org — no self-hosting). Run once in the Supabase SQL editor.

create table if not exists public.audio_tracks (
  id bigint generated always as identity primary key,
  translation text not null,
  book text not null,
  chapter_start int not null,
  chapter_end int not null,
  url text not null,
  label text not null
);

create index if not exists audio_tracks_lookup
  on public.audio_tracks (translation, book, chapter_start, chapter_end);

alter table public.audio_tracks enable row level security;

create policy "audio tracks are public" on public.audio_tracks for select using (true);

grant select on public.audio_tracks to anon, authenticated;
grant select, insert, update, delete on public.audio_tracks to service_role;
grant usage, select on all sequences in schema public to service_role;
