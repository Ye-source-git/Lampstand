import { config } from "dotenv";
config({ path: ".env.local" });

// These are integration tests: they create real users and rows and assert on
// real RLS behavior. That's only safe against the local Docker Supabase
// stack — refuse to run against anything else, so a mis-pointed .env.local
// (e.g. temporarily swapped to .env.prod-backup) can never let this suite
// touch production.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const isLocal = url.includes("127.0.0.1") || url.includes("localhost");

if (!isLocal) {
  throw new Error(
    `Refusing to run: NEXT_PUBLIC_SUPABASE_URL ("${url}") is not a local address.\n` +
      `These tests create and delete real data and must only run against the local ` +
      `Supabase stack (npx supabase start). Check .env.local.`
  );
}
