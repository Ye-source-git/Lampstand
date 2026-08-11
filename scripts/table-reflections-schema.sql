-- Phase 3 of Tables: opt-in reflection sharing. Journal stays private by
-- default (the existing "own journal" policy is untouched) — this adds one
-- nullable column so a specific entry can be shared with one table, chosen
-- at the moment of writing (or later, and revocable at any time). No open
-- visibility: sharing is always a deliberate, per-entry choice.
-- Run once in the Supabase SQL editor, after tables-schema.sql and
-- tables-rls-fix.sql.

alter table public.journal_entries
  add column if not exists shared_with_table_id bigint references public.tables(id) on delete set null;

create policy "shared reflections visible to table members" on public.journal_entries
  for select using (shared_with_table_id is not null and public.is_table_member(shared_with_table_id));
