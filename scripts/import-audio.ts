// Imports audio track metadata (not the audio itself — files stream directly from
// archive.org) for the three complete, public-domain LibriVox recordings that match
// Longtable's translations: KJV, WEB, and ASV.
//
// Usage: npm run import:audio

import { config } from "dotenv";
config({ path: ".env.local" });
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_BOOKS } from "@/lib/constants";

const SOURCES: { translation: string; identifier: string }[] = [
  { translation: "kjv", identifier: "bible_kjv_complete_2001_librivox" },
  { translation: "web", identifier: "biblewebcomplete_2510_librivox" },
  { translation: "asv", identifier: "bible_asv_complete_2112_librivox" },
];

const CHAPTER_COUNT = new Map(ALL_BOOKS.map(([b, n]) => [b, n]));
const CANONICAL = new Set(ALL_BOOKS.map(([b]) => b));

// Longest-name-first alternation so "1 Corinthians" matches before a bare "1" could.
const BOOK_PATTERN = new RegExp(
  "^(" +
    ALL_BOOKS.map(([b]) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .sort((a, b) => b.length - a.length)
      .join("|") +
    ")\\s*(?:Ch\\.?\\s*)?(\\d+)?\\s*-?\\s*(\\d+)?\\s*$",
  "i"
);

type Track = { translation: string; book: string; chapterStart: number; chapterEnd: number; url: string; label: string };

export function parseSegment(translation: string, identifier: string, filename: string, segment: string): Track | null {
  const cleaned = segment.trim().replace(/Phillipians/i, "Philippians");
  const match = cleaned.match(BOOK_PATTERN);
  if (!match) {
    console.warn(`  ! could not parse segment "${segment}" in ${filename}`);
    return null;
  }
  const bookRaw = match[1];
  const book = [...CANONICAL].find((b) => b.toLowerCase() === bookRaw.toLowerCase());
  if (!book) {
    console.warn(`  ! unknown book "${bookRaw}" in ${filename}`);
    return null;
  }
  const totalChapters = CHAPTER_COUNT.get(book)!;
  const start = match[2] ? Number(match[2]) : 1;
  const end = match[3] ? Number(match[3]) : match[2] ? start : totalChapters;

  return {
    translation,
    book,
    chapterStart: start,
    // Source metadata has an occasional off-by-a-few typo (e.g. WEB lists Hebrews as
    // "1 - 16" though it only has 13 chapters) — clamp rather than store a bogus range.
    chapterEnd: Math.min(end, totalChapters),
    url: `https://archive.org/download/${identifier}/${filename}`,
    label: segment.trim(),
  };
}

async function importSource({ translation, identifier }: { translation: string; identifier: string }) {
  console.log(`Fetching ${translation.toUpperCase()} audio metadata (${identifier}) …`);
  const res = await fetch(`https://archive.org/metadata/${identifier}`);
  if (!res.ok) throw new Error(`Failed to fetch metadata for ${identifier}: ${res.status}`);
  const data = await res.json();

  const mp3s: { name: string; title?: string }[] = data.files.filter(
    (f: { name: string }) => f.name.endsWith(".mp3") && !f.name.includes("64kb") && !f.name.includes("128kb")
  );

  const tracks: Track[] = [];
  for (const f of mp3s) {
    const title = (f.title || "").replace(/^\d+\s*-\s*/, "");
    // A handful of tracks bundle several short books into one file, e.g.
    // "1 John 1 - 5, 2 John 1, 3 John 1" — each comma-separated part is its own book.
    for (const segment of title.split(",")) {
      const track = parseSegment(translation, identifier, f.name, segment);
      if (track) tracks.push(track);
    }
  }
  console.log(`  parsed ${tracks.length} of ${mp3s.length} files`);
  return tracks;
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exitCode = 1;
    return;
  }
  const supabase = createAdminClient();

  const allTracks: Track[] = [];
  for (const source of SOURCES) {
    allTracks.push(...(await importSource(source)));
  }

  console.log(`Replacing audio_tracks with ${allTracks.length} rows …`);
  for (const translation of SOURCES.map((s) => s.translation)) {
    const { error } = await supabase.from("audio_tracks").delete().eq("translation", translation);
    if (error) throw error;
  }

  const rows = allTracks.map((t) => ({
    translation: t.translation,
    book: t.book,
    chapter_start: t.chapterStart,
    chapter_end: t.chapterEnd,
    url: t.url,
    label: t.label,
  }));

  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from("audio_tracks").insert(rows.slice(i, i + CHUNK));
    if (error) throw error;
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
