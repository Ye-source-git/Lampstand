// Imports the output of scripts/align-audio.py (an offline forced-alignment
// pipeline) into audio_verse_timestamps.
// Usage: npm run import:audio-timestamps -- alignment_output.json

import { config } from "dotenv";
config({ path: ".env.local" });
import { createAdminClient } from "@/lib/supabase/admin";
import { readFileSync } from "fs";

type Row = {
  audio_track_id: number;
  translation: string;
  book: string;
  chapter: number;
  verse: number;
  start_seconds: number;
  end_seconds: number;
};

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: npm run import:audio-timestamps -- <path-to-alignment-output.json>");
    process.exitCode = 1;
    return;
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exitCode = 1;
    return;
  }
  const supabase = createAdminClient();
  const rows: Row[] = JSON.parse(readFileSync(file, "utf-8"));

  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase
      .from("audio_verse_timestamps")
      .upsert(rows.slice(i, i + CHUNK), { onConflict: "translation,book,chapter,verse" });
    if (error) throw error;
  }
  console.log(`Imported ${rows.length} verse timestamps from ${file}.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
