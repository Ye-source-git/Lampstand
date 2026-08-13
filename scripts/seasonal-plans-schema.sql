-- Marks a plan as seasonal (Advent, Holy Week). The actual date window for
-- each season is computed in code (lib/seasons.ts), not stored here, since
-- Holy Week moves with Easter every year — this column just says *which*
-- season a plan belongs to, so the Today page knows when to promote it.
-- Run once in the Supabase SQL editor.

alter table public.plans add column if not exists season_key text;
