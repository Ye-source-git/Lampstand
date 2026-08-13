// Seeds the M'Cheyne one-year reading plan (365 days, 4 passages/day: 2
// "Family," 2 "Secret") by parsing scripts/mcheyne-source.html — a static
// copy of bibleplan.org's print view, fetched once and committed so seeding
// doesn't depend on a live external site. The underlying calendar itself is
// Robert Murray M'Cheyne's original 1842 public-domain schedule, reproduced
// near-identically across dozens of ministries; this is one such faithful
// reproduction, cross-checked against known facts about the plan (Day 1
// opens Genesis 1 / Matthew 1; the Family OT track closes the year at
// 2 Chronicles while the Secret OT track closes at Malachi — both
// distinctive, correct details).
//
// Usage: npm run seed:mcheyne

import { config } from "dotenv";
config({ path: ".env.local" });
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_BOOKS } from "@/lib/constants";
import { readFileSync } from "fs";
import { join } from "path";

const CANONICAL = new Set(ALL_BOOKS.map(([b]) => b));
const BOOK_ALIASES: Record<string, string> = { Psalm: "Psalms" };

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "’")
    .replace(/\s*&\s*/g, " & ");
}

function parseRef(raw: string) {
  const display = decodeEntities(raw).trim();
  // Captures the book name and the *first* chapter number, which correctly
  // handles every shape in this data: "Genesis 1", "Zechariah 13:2-9"
  // (verse range), "Genesis 9-10" (chapter range), "Jeremiah 36 & 45"
  // (two non-contiguous chapters) — in each case the first chapter number
  // is the right navigation target, and the full original text is kept
  // as the display label so nothing is silently truncated.
  const m = display.match(/^([1-3]?\s?[A-Za-z ]+?)\s+(\d+)/);
  if (!m) throw new Error(`Could not parse reference: "${display}"`);
  const bookRaw = m[1].trim();
  const book = BOOK_ALIASES[bookRaw] ?? bookRaw;
  if (!CANONICAL.has(book)) throw new Error(`Unknown book "${book}" (from "${display}")`);
  return { display, book, chapter: Number(m[2]) };
}

type Passage = { group: "family" | "secret"; display: string; book: string; chapter: number };
type Day = { primary: Passage; extra: Passage[]; label: string };

function parseSource(html: string): Day[] {
  const rows = [...html.matchAll(/<td class="day">([^<]+)<\/td>\s*<td>([\s\S]+?)<\/td>/g)];
  if (rows.length !== 365) throw new Error(`Expected 365 day rows, found ${rows.length}`);

  return rows.map(([, , cellRaw]) => {
    const cell = decodeEntities(cellRaw).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const m = cell.match(/Family:\s*(.+?)\s*\|\s*Secret:\s*(.+)$/);
    if (!m) throw new Error(`Could not split Family/Secret in: "${cell}"`);
    const [family1, family2] = m[1].split(",").map((s) => parseRef(s));
    const [secret1, secret2] = m[2].split(",").map((s) => parseRef(s));

    return {
      primary: { group: "family", ...family1 },
      extra: [
        { group: "family", ...family2 },
        { group: "secret", ...secret1 },
        { group: "secret", ...secret2 },
      ],
      label: `${family1.display} & ${family2.display}`,
    };
  });
}

const REFLECTION_PROMPT = "What stood out to you in today's reading?";

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exitCode = 1;
    return;
  }
  const supabase = createAdminClient();

  const html = readFileSync(join(__dirname, "mcheyne-source.html"), "utf-8");
  const days = parseSource(html);
  console.log(`Parsed ${days.length} days.`);

  const { error: planError } = await supabase.from("plans").upsert(
    {
      id: "mcheyne-one-year",
      title: "The M’Cheyne Reading Plan",
      blurb:
        "Robert Murray M’Cheyne’s classic 1842 calendar — four short readings a day, covering the Old Testament once and the New Testament and Psalms twice in a year.",
      category: "whole-bible",
      tags: ["whole bible", "one year", "classic"],
      total_days: days.length,
      sort_order: 11,
    },
    { onConflict: "id" }
  );
  if (planError) throw planError;
  console.log("Seeded plan row.");

  const dayRows = days.map((d, i) => ({
    plan_id: "mcheyne-one-year",
    day_index: i,
    label: d.label,
    book: d.primary.book,
    chapter: d.primary.chapter,
    devotional: null,
    reflection_prompt: REFLECTION_PROMPT,
    guided_prayer: null,
    extra_passages: d.extra,
  }));

  const CHUNK = 100;
  for (let i = 0; i < dayRows.length; i += CHUNK) {
    const { error } = await supabase.from("plan_days").upsert(dayRows.slice(i, i + CHUNK), { onConflict: "plan_id,day_index" });
    if (error) throw error;
  }
  console.log(`Seeded ${dayRows.length} plan_days.`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
