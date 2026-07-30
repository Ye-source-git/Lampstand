-- The handoff schema created tables but never granted the standard Supabase
-- role privileges on them, so even the service_role key gets "permission
-- denied" (this is separate from Row Level Security, which was set up
-- correctly). Run this once in the Supabase SQL editor.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on
  public.verses, public.book_notes, public.cross_refs, public.glossary,
  public.marks, public.journal_entries, public.plan_progress, public.ai_usage
to service_role;

grant select on
  public.verses, public.book_notes, public.cross_refs, public.glossary
to anon, authenticated;

grant select, insert, update, delete on
  public.marks, public.journal_entries, public.plan_progress
to authenticated;

grant select on public.ai_usage to authenticated;

grant usage, select on all sequences in schema public to service_role, authenticated;
