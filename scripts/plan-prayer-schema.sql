-- Adds a guided-prayer prompt per plan day (nullable — only populated for
-- topical/life-application plans, not the whole-bible sweep plans where a
-- forced daily prayer would feel like filler).
--
-- Run once in the Supabase SQL editor.

alter table public.plan_days add column if not exists guided_prayer text;
