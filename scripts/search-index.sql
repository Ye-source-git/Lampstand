-- Full-text search over scripture. Run once in the Supabase SQL editor.

create index if not exists verses_text_search_idx
  on public.verses using gin (to_tsvector('english', text));

create or replace function public.search_verses(
  query text,
  p_translation text default 'web',
  p_limit int default 40
)
returns table (book text, chapter int, verse int, text text, rank real)
language sql
stable
as $$
  select book, chapter, verse, text,
    ts_rank(to_tsvector('english', text), websearch_to_tsquery('english', query)) as rank
  from public.verses
  where translation = p_translation
    and to_tsvector('english', text) @@ websearch_to_tsquery('english', query)
  order by rank desc, book, chapter, verse
  limit p_limit;
$$;

grant execute on function public.search_verses(text, text, int) to anon, authenticated;
