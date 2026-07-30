-- Atomic daily-usage counter for the Companion/Guide API routes.
--
-- The original read-then-upsert pattern (select count, compare, then upsert)
-- has a race window: two concurrent requests can both read the same count,
-- both pass the cap check, and both write — letting a user exceed
-- DAILY_LIMIT. This function makes the increment-and-read a single atomic
-- statement instead.
--
-- Run once in the Supabase SQL editor.

create or replace function public.increment_ai_usage(p_user_id uuid)
returns int
language sql
as $$
  insert into public.ai_usage (user_id, day, count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, day)
  do update set count = ai_usage.count + 1
  returning count;
$$;

grant execute on function public.increment_ai_usage(uuid) to service_role;
