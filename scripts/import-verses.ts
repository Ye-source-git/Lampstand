// Imports WEB, KJV, and ASV verse text into the Supabase `verses` table.
//
// Sources (all public domain):
//   - KJV / ASV: scrollmapper/bible_databases (formats/csv) — https://github.com/scrollmapper/bible_databases
//     Note: that repo does not actually ship World English Bible text (its sources/en/WEB
//     directory is empty), so WEB comes from seven1m/open-bibles instead — the same
//     eng-web.usfx.xml dataset that bible-api.com (used by the prototype) serves.
//   - WEB: seven1m/open-bibles — https://github.com/seven1m/open-bibles
//
// Usage: npm run import:verses

import { config } from "dotenv";
config({ path: ".env.local" });
import { parse } from "csv-parse/sync";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_BOOKS } from "@/lib/constants";
import { USFX_CODE_TO_BOOK, CSV_BOOK_TO_BOOK } from "./bible-book-codes";

const CANONICAL_BOOKS = new Set(ALL_BOOKS.map(([b]) => b));

type VerseRow = { translation: string; book: string; chapter: number; verse: number; text: string };

async function fetchText(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

async function loadCsvTranslation(translation: string, url: string): Promise<VerseRow[]> {
  console.log(`Fetching ${translation.toUpperCase()} from ${url} …`);
  const csv = await fetchText(url);
  const records: { Book: string; Chapter: string; Verse: string; Text: string }[] = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  });

  const rows: VerseRow[] = [];
  for (const r of records) {
    const book = CSV_BOOK_TO_BOOK[r.Book] ?? r.Book;
    if (!CANONICAL_BOOKS.has(book)) continue;
    rows.push({
      translation,
      book,
      chapter: Number(r.Chapter),
      verse: Number(r.Verse),
      text: r.Text.trim(),
    });
  }
  return rows;
}

// Minimal streaming tokenizer for USFX XML — the format is a flat sequence of
// self-closing verse/chapter markers interleaved with text, which doesn't map
// cleanly onto a DOM tree, so a hand-rolled scanner is simpler than a full parser.
function parseUsfx(xml: string, translation: string): VerseRow[] {
  const rows: VerseRow[] = [];
  const tokenPattern = /<[^>]+>|[^<]+/g;

  let currentBook: string | null = null;
  let currentChapter = 0;
  let currentVerse = 0;
  let buffer: string[] = [];
  let footnoteDepth = 0;

  function finalizeVerse() {
    if (currentBook && currentChapter && currentVerse) {
      const text = buffer.join("").replace(/\s+/g, " ").trim();
      if (text) {
        rows.push({ translation, book: currentBook, chapter: currentChapter, verse: currentVerse, text });
      }
    }
    buffer = [];
  }

  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(xml))) {
    const token = match[0];
    if (token[0] !== "<") {
      if (footnoteDepth === 0) buffer.push(token);
      continue;
    }

    const bookOpen = token.match(/^<book id="([A-Z0-9]+)">$/);
    if (bookOpen) {
      finalizeVerse();
      currentVerse = 0;
      currentChapter = 0;
      currentBook = USFX_CODE_TO_BOOK[bookOpen[1]] ?? null;
      continue;
    }
    if (token === "</book>") {
      finalizeVerse();
      currentBook = null;
      currentVerse = 0;
      continue;
    }

    const chapterTag = token.match(/^<c id="(\d+)"/);
    if (chapterTag) {
      finalizeVerse();
      currentChapter = Number(chapterTag[1]);
      currentVerse = 0;
      continue;
    }

    const verseTag = token.match(/^<v id="(\d+)/);
    if (verseTag) {
      finalizeVerse();
      currentVerse = Number(verseTag[1]);
      continue;
    }
    if (token === "<ve/>") {
      finalizeVerse();
      currentVerse = 0;
      continue;
    }

    if (/^<f\b/.test(token)) {
      footnoteDepth += 1;
      continue;
    }
    if (token === "</f>") {
      footnoteDepth = Math.max(0, footnoteDepth - 1);
      continue;
    }
    // All other tags (formatting, cross-refs, paragraph/section markers) are transparent.
  }
  finalizeVerse();

  return rows;
}

async function loadWeb(): Promise<VerseRow[]> {
  const url = "https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-web.usfx.xml";
  console.log(`Fetching WEB from ${url} …`);
  const xml = await fetchText(url);
  return parseUsfx(xml, "web");
}

async function importTranslation(supabase: ReturnType<typeof createAdminClient>, translation: string, rows: VerseRow[]) {
  console.log(`Importing ${rows.length} ${translation.toUpperCase()} verses …`);

  const { error: deleteError } = await supabase.from("verses").delete().eq("translation", translation);
  if (deleteError) throw deleteError;

  const CHUNK = 1000;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from("verses").insert(chunk);
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

  const [web, kjv, asv] = await Promise.all([
    loadWeb(),
    loadCsvTranslation("kjv", "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/csv/KJV.csv"),
    loadCsvTranslation("asv", "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/csv/ASV.csv"),
  ]);

  for (const [translation, rows] of [["web", web], ["kjv", kjv], ["asv", asv]] as const) {
    await importTranslation(supabase, translation, rows);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
