// Uploads verse-by-verse commentary extracted from public-domain SWORD modules
// (Matthew Henry, Jamieson-Fausset-Brown, Barnes') to Supabase.
//
// The extraction itself runs in Python (pysword) against CrossWire SWORD module
// files — see scripts/extract-commentary.py for that step, which must be run first
// to produce scripts/.data/commentary.json (gitignored; not part of the repo).
//
// Requires scripts/commentary-prose-schema.sql to have been run first.
// Usage: npm run import:commentary-prose

import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "fs";
import { createAdminClient } from "@/lib/supabase/admin";

type Row = { book: string; chapter: number; verse: number; source: string; text: string };

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exitCode = 1;
    return;
  }

  const dataPath = process.argv[2] ?? "scripts/.data/commentary.json";
  console.log(`Reading ${dataPath} …`);
  const rows: Row[] = JSON.parse(readFileSync(dataPath, "utf-8"));
  console.log(`  ${rows.length} rows`);

  const bySource = new Map<string, number>();
  for (const r of rows) bySource.set(r.source, (bySource.get(r.source) ?? 0) + 1);
  for (const [source, count] of bySource) console.log(`  ${source}: ${count}`);

  const supabase = createAdminClient();

  console.log("Replacing commentary …");
  for (const source of bySource.keys()) {
    const { error } = await supabase.from("commentary").delete().eq("source", source);
    if (error) throw error;
  }

  const CHUNK = 1000;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from("commentary").insert(rows.slice(i, i + CHUNK));
    if (error) throw error;
    process.stdout.write(`\r  ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }
  process.stdout.write("\n");
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
