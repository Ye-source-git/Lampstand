// Imports two public-domain reference works to deepen the Companion's grounding:
//   - Treasury of Scripture Knowledge (R.A. Torrey, 1897) → cross_refs, upgraded to
//     verse-level (~382,000 references vs. the previous ~60 hand-curated chapters).
//     Source: ariseshinestudio/TSK on GitHub, packaged from JustVerses.com.
//   - Easton's Bible Dictionary (M.G. Easton, 1897) → glossary, added *only* for terms
//     not already covered by the curated glossary. The curated entries are kept as-is
//     because they're written in Longtable's neutral, multi-tradition voice — Easton's
//     is a single-perspective 19th-century reference work and shouldn't overwrite them
//     on doctrinally sensitive terms; it's genuinely useful for the thousands of
//     historical/geographical/biographical terms the curated list never touched.
//
// Requires scripts/commentary-schema.sql to have been run first (cross_refs upgrade).
// Usage: npm run import:commentary

import { config } from "dotenv";
config({ path: ".env.local" });
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_BOOKS } from "@/lib/constants";

const TSK_ABBR: Record<string, string> = {
  ge: "Genesis", ex: "Exodus", le: "Leviticus", nu: "Numbers", de: "Deuteronomy",
  jos: "Joshua", jud: "Judges", ru: "Ruth", "1sa": "1 Samuel", "2sa": "2 Samuel",
  "1ki": "1 Kings", "2ki": "2 Kings", "1ch": "1 Chronicles", "2ch": "2 Chronicles",
  ezr: "Ezra", ne: "Nehemiah", es: "Esther", job: "Job", ps: "Psalms", pr: "Proverbs",
  ec: "Ecclesiastes", so: "Song of Solomon", isa: "Isaiah", jer: "Jeremiah",
  la: "Lamentations", eze: "Ezekiel", da: "Daniel", ho: "Hosea", joe: "Joel",
  am: "Amos", ob: "Obadiah", jon: "Jonah", mic: "Micah", na: "Nahum", hab: "Habakkuk",
  zep: "Zephaniah", hag: "Haggai", zec: "Zechariah", mal: "Malachi",
  mt: "Matthew", mr: "Mark", lu: "Luke", joh: "John", ac: "Acts", ro: "Romans",
  "1co": "1 Corinthians", "2co": "2 Corinthians", ga: "Galatians", eph: "Ephesians",
  php: "Philippians", col: "Colossians", "1th": "1 Thessalonians", "2th": "2 Thessalonians",
  "1ti": "1 Timothy", "2ti": "2 Timothy", tit: "Titus", phm: "Philemon", heb: "Hebrews",
  jas: "James", "1pe": "1 Peter", "2pe": "2 Peter", "1jo": "1 John", "2jo": "2 John",
  "3jo": "3 John", jude: "Jude", re: "Revelation",
};

const TSK_BOOK_BY_KEY = new Map<number, string>(ALL_BOOKS.map(([b], i) => [i + 1, b]));

function formatRefList(raw: string): string[] {
  return raw
    .split(";")
    .map((seg) => seg.trim())
    .filter(Boolean)
    .map((seg) => {
      const m = seg.match(/^([1-3]?[a-z]+)\s+(.+)$/i);
      if (!m) return seg;
      const full = TSK_ABBR[m[1].toLowerCase()];
      return full ? `${full} ${m[2]}` : seg;
    });
}

async function importCrossRefs(supabase: ReturnType<typeof createAdminClient>) {
  console.log("Fetching TSK cross-reference data …");
  const res = await fetch("https://raw.githubusercontent.com/ariseshinestudio/TSK/main/tskxref.txt");
  if (!res.ok) throw new Error(`Failed to fetch TSK data: ${res.status}`);
  const raw = await res.text();
  const lines = raw.split("\n").filter(Boolean);
  console.log(`  ${lines.length} TSK phrase-level entries`);

  const byVerse = new Map<string, Set<string>>();
  for (const line of lines) {
    const parts = line.split("\t");
    if (parts.length < 6) continue;
    const [bookKeyStr, chapterStr, verseStr, , , refList] = parts;
    const book = TSK_BOOK_BY_KEY.get(Number(bookKeyStr));
    if (!book) continue; // deuterocanonical — out of scope
    const key = `${book}|${chapterStr}|${verseStr}`;
    const set = byVerse.get(key) ?? new Set<string>();
    for (const ref of formatRefList(refList)) {
      if (set.size < 24) set.add(ref);
    }
    byVerse.set(key, set);
  }
  console.log(`  ${byVerse.size} verses with cross-references`);

  const rows = [...byVerse.entries()].map(([key, refs]) => {
    const [book, chapter, verse] = key.split("|");
    return { book, chapter: Number(chapter), verse: Number(verse), refs: [...refs].join("; ") };
  });

  console.log("Replacing cross_refs …");
  const { error: delErr } = await supabase.from("cross_refs").delete().gte("id", 0);
  if (delErr) throw delErr;

  const CHUNK = 1000;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from("cross_refs").insert(rows.slice(i, i + CHUNK));
    if (error) throw error;
    process.stdout.write(`\r  ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }
  process.stdout.write("\n");
}

async function importGlossary(supabase: ReturnType<typeof createAdminClient>) {
  console.log("Fetching Easton's Bible Dictionary …");
  const res = await fetch(
    "https://raw.githubusercontent.com/garydavenport73/eastons-bible-dictionary-json/main/eastons.json"
  );
  if (!res.ok) throw new Error(`Failed to fetch Easton's dictionary: ${res.status}`);
  const data: Record<string, { definition: string }[]> = await res.json();

  const { data: existing, error: existingErr } = await supabase.from("glossary").select("term");
  if (existingErr) throw existingErr;
  const existingTerms = new Set((existing ?? []).map((r) => r.term));
  console.log(`  ${existingTerms.size} curated terms preserved as-is`);

  const rows = Object.entries(data)
    .map(([headword, senses]) => ({
      term: headword.toLowerCase(),
      entry: `${headword}: ${senses.map((s) => s.definition).join(" ")}`,
    }))
    .filter((r) => r.term && !existingTerms.has(r.term));
  console.log(`  adding ${rows.length} entries from Easton's Bible Dictionary (1897, public domain)`);

  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from("glossary").upsert(rows.slice(i, i + CHUNK), { onConflict: "term" });
    if (error) throw error;
    process.stdout.write(`\r  ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }
  process.stdout.write("\n");
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exitCode = 1;
    return;
  }
  const supabase = createAdminClient();

  await importCrossRefs(supabase);
  await importGlossary(supabase);

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
