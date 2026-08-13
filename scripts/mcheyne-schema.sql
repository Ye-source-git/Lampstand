-- The M'Cheyne plan reads 4 passages a day (2 "Family," 2 "Secret"), unlike
-- every other plan here which has one passage per day. Rather than a new
-- table, this adds one nullable JSONB column holding the 3 passages beyond
-- the primary book/chapter (which stays the first Family reading, so the
-- existing single-passage plans and all Plans-page logic are untouched).
-- Run once in the Supabase SQL editor.

alter table public.plan_days add column if not exists extra_passages jsonb;
