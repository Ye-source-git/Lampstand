import type { SupabaseClient } from "@supabase/supabase-js";
import { ALL_BOOKS, normalizeBook } from "@/lib/constants";

export type Source = { id: string; kind: string; label: string };

const BOOK_PATTERN = new RegExp(
  "\\b(" +
    ALL_BOOKS.map(([b]) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .sort((a, b) => b.length - a.length)
      .join("|") +
    ")\\s+(\\d{1,3})(?::(\\d{1,3}))?",
  "i"
);

// Server-side grounding pipeline: mirrors the prototype's gatherSources, but reads
// scripture + reference tables from Supabase instead of fetching bible-api.com.
export async function gatherSources(
  supabase: SupabaseClient,
  question: string,
  history: { role: string; content: string }[]
): Promise<{ sources: Source[]; sourceBlock: string }> {
  const sources: Source[] = [];
  const blocks: string[] = [];
  let n = 0;

  function add(kind: string, label: string, content: string) {
    n += 1;
    const id = `S${n}`;
    sources.push({ id, kind, label });
    blocks.push(`[${id}] (${kind}) ${label}\n${content}`);
  }

  const recentText = [question, ...history.slice(-4).map((m) => m.content)].join("\n");
  const match = question.match(BOOK_PATTERN) || recentText.match(BOOK_PATTERN);

  if (match) {
    const book = normalizeBook(match[1]);
    const chapter = Number(match[2]);

    const { data: verseRows } = await supabase
      .from("verses")
      .select("verse, text")
      .eq("translation", "web")
      .eq("book", book)
      .eq("chapter", chapter)
      .order("verse", { ascending: true });

    if (verseRows && verseRows.length) {
      const text = verseRows.map((v) => `${v.verse} ${v.text}`).join(" ");
      add(
        "Scripture — World English Bible",
        `${book} ${chapter}`,
        text.length > 2600 ? text.slice(0, 2600) + "…" : text
      );
    }

    const { data: noteRow } = await supabase
      .from("book_notes")
      .select("note")
      .eq("book", book)
      .maybeSingle();
    if (noteRow?.note) {
      add("Background — Lampstand study notes", `About the book of ${book}`, noteRow.note);
    }

    // Cross-references are verse-level (Treasury of Scripture Knowledge) — only
    // meaningful when the question names a specific verse, not just a chapter.
    const verse = match[3] ? Number(match[3]) : null;
    if (verse) {
      const { data: crossRow } = await supabase
        .from("cross_refs")
        .select("refs")
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("verse", verse)
        .maybeSingle();
      if (crossRow?.refs) {
        add(
          "Cross-references — Treasury of Scripture Knowledge",
          `Passages connected to ${book} ${chapter}:${verse}`,
          crossRow.refs
        );
      }
    }
  }

  // Glossary terms mentioned in the question or recent conversation. The glossary is
  // large (curated entries plus Easton's Bible Dictionary), so rather than fetching
  // every row, extract 1-3 word candidate phrases from the text and look them up by
  // exact match — indexed, and immune to the substring false positives naive
  // matching would produce (e.g. "using" would never match a term like "sin").
  const words = recentText.toLowerCase().match(/[a-z']+/g) ?? [];
  const candidates = new Set<string>();
  for (let n2 = 1; n2 <= 3; n2++) {
    for (let i = 0; i + n2 <= words.length; i++) {
      candidates.add(words.slice(i, i + n2).join(" "));
    }
  }
  if (candidates.size) {
    const { data: glossaryRows } = await supabase
      .from("glossary")
      .select("term, entry")
      .in("term", [...candidates]);
    if (glossaryRows) {
      for (const { entry } of glossaryRows) {
        if (n >= 6) break;
        add("Glossary — Lampstand study notes", entry.split(":")[0], entry);
      }
    }
  }

  // Being honest about what wasn't found matters as much as citing what was: the
  // Companion's own instructions ask it to flag general-knowledge answers plainly
  // rather than imply they came from retrieved sources, but it can only do that if
  // it's told there was nothing to retrieve.
  const sourceBlock = blocks.length
    ? `SOURCES:\n${blocks.join("\n\n")}`
    : "NO SOURCES: nothing in Lampstand's scripture text, study notes, cross-references, or glossary matched this question (it likely isn't a direct passage or study-term lookup). Answer from your general knowledge if you can, but say so plainly — per your instructions, don't imply an answer is grounded in retrieved sources when it isn't.";

  return { sources, sourceBlock };
}
