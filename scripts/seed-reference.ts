// Seeds book_notes, cross_refs, and glossary from the prototype's reference data.
// Usage: npm run seed:reference

import { config } from "dotenv";
config({ path: ".env.local" });
import { createAdminClient } from "@/lib/supabase/admin";
import { BOOK_NOTES, CROSS_REFS, GLOSSARY } from "./reference-data";

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exitCode = 1;
    return;
  }
  const supabase = createAdminClient();

  const bookNoteRows = Object.entries(BOOK_NOTES).map(([book, note]) => ({ book, note }));
  const { error: notesError } = await supabase.from("book_notes").upsert(bookNoteRows, { onConflict: "book" });
  if (notesError) throw notesError;
  console.log(`Seeded ${bookNoteRows.length} book notes.`);

  const crossRefRows = Object.entries(CROSS_REFS).map(([key, refs]) => {
    const [book, chapter] = key.split("|");
    return { book, chapter: Number(chapter), refs };
  });
  const { error: crossRefsError } = await supabase.from("cross_refs").upsert(crossRefRows, { onConflict: "book,chapter" });
  if (crossRefsError) throw crossRefsError;
  console.log(`Seeded ${crossRefRows.length} cross-references.`);

  const glossaryRows = Object.entries(GLOSSARY).map(([term, entry]) => ({ term, entry }));
  const { error: glossaryError } = await supabase.from("glossary").upsert(glossaryRows, { onConflict: "term" });
  if (glossaryError) throw glossaryError;
  console.log(`Seeded ${glossaryRows.length} glossary terms.`);

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
