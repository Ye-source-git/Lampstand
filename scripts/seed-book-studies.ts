// Auto-generates a chapter-by-chapter study plan for every book of the Bible,
// reusing the existing plans/plan_days schema (no new tables). Unlike the
// hand-curated plans, these are structural, not devotional: one day per
// chapter, no invented commentary. The value is the reading path itself —
// depth comes from the cross-references and commentary already surfaced on
// the Read page as you go, not from new authored text here. category
// "book-study" is deliberately excluded from the main category-grouped list
// on the Plans page (see CATEGORY_ORDER in app/plans/page.tsx) and reached
// instead through a book picker, since 66 plans would overwhelm that list.
//
// Usage: npm run seed:book-studies

import { config } from "dotenv";
config({ path: ".env.local" });
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_BOOKS } from "@/lib/constants";

function slugify(book: string) {
  return book.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const REFLECTION_PROMPT = "What stood out to you in this chapter?";

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exitCode = 1;
    return;
  }
  const supabase = createAdminClient();

  const { data: notes } = await supabase.from("book_notes").select("book, note");
  const noteByBook = new Map((notes ?? []).map((n) => [n.book, n.note as string]));

  const planRows = ALL_BOOKS.map(([book, chapters]) => {
    const note = noteByBook.get(book);
    const truncated = note?.split(". ").slice(0, 2).join(". ");
    return {
      id: `book-${slugify(book)}`,
      title: `${book}: A Chapter-by-Chapter Study`,
      blurb: truncated ? (truncated.endsWith(".") ? truncated : truncated + ".") : `${chapters} chapters, one a day, straight through ${book}.`,
      category: "book-study",
      tags: ["book study", book],
      total_days: chapters,
      sort_order: 1000, // grouped after hand-curated plans; not shown in the category list anyway
    };
  });

  const { error: plansError } = await supabase.from("plans").upsert(planRows, { onConflict: "id" });
  if (plansError) throw plansError;
  console.log(`Seeded ${planRows.length} book-study plans.`);

  for (const [book, chapters] of ALL_BOOKS) {
    const note = noteByBook.get(book);
    const dayRows = Array.from({ length: chapters }, (_, i) => ({
      plan_id: `book-${slugify(book)}`,
      day_index: i,
      label: `Chapter ${i + 1}`,
      book,
      chapter: i + 1,
      devotional: i === 0 ? note ?? null : null,
      reflection_prompt: REFLECTION_PROMPT,
      guided_prayer: null,
    }));
    const { error } = await supabase.from("plan_days").upsert(dayRows, { onConflict: "plan_id,day_index" });
    if (error) throw error;
  }
  console.log(`Seeded plan_days for all ${ALL_BOOKS.length} books.`);

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
