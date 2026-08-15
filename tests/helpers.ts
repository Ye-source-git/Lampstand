import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Bypasses RLS — for test setup/teardown only, never for assertions.
export function adminClient(): SupabaseClient {
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export type TestUser = { id: string; email: string; client: SupabaseClient };

// Creates a confirmed user and returns a client signed in as them — this
// client respects RLS exactly like a real logged-in user's browser session,
// which is the whole point: assertions run through it, not the admin client.
export async function createTestUser(label: string): Promise<TestUser> {
  const email = `test-${label}-${randomUUID()}@example.com`;
  const password = `Test${randomUUID()}!`;
  const admin = adminClient();

  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw error ?? new Error("createUser returned no user");

  const client = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  return { id: data.user.id, email, client };
}

// Deletes rows a test user might have created, across every user-scoped and
// table-scoped table, then the auth user itself. Order matters: children
// before parents (a table's members/plans/prayer content before the table
// row, since those aren't set up with ON DELETE CASCADE).
export async function cleanupUser(userId: string) {
  const admin = adminClient();
  const ownedTables = await admin.from("tables").select("id").eq("created_by", userId);
  const tableIds = (ownedTables.data ?? []).map((t) => t.id);

  if (tableIds.length > 0) {
    await admin.from("verse_discussions").delete().in("table_id", tableIds);
    await admin.from("verse_discussion_locks").delete().in("table_id", tableIds);
    await admin.from("prayer_acknowledgments").delete().in(
      "prayer_id",
      (await admin.from("prayer_requests").select("id").in("table_id", tableIds)).data?.map((r) => r.id) ?? []
    );
    await admin.from("prayer_requests").delete().in("table_id", tableIds);
    await admin.from("table_plans").delete().in("table_id", tableIds);
    await admin.from("table_members").delete().in("table_id", tableIds);
  }

  await admin.from("verse_discussions").delete().eq("user_id", userId);
  await admin.from("prayer_acknowledgments").delete().eq("user_id", userId);
  await admin.from("prayer_requests").delete().eq("user_id", userId);
  await admin.from("table_members").delete().eq("user_id", userId);
  await admin.from("journal_entries").delete().eq("user_id", userId);
  await admin.from("marks").delete().eq("user_id", userId);
  await admin.from("plan_progress").delete().eq("user_id", userId);
  await admin.from("ai_usage").delete().eq("user_id", userId);

  if (tableIds.length > 0) await admin.from("tables").delete().in("id", tableIds);

  await admin.auth.admin.deleteUser(userId);
}

// An anon (never-signed-in) client — same as a first-time, not-yet-anonymous-
// signed-in visitor hitting the API with just the public anon key.
export function anonClient(): SupabaseClient {
  return createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
}
