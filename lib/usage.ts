import type { SupabaseClient } from "@supabase/supabase-js";

export const DAILY_AI_LIMIT = 20;

// Atomically increments today's usage row and reports whether the caller is
// still within DAILY_AI_LIMIT. Uses the increment_ai_usage() Postgres function
// (scripts/increment-ai-usage-function.sql) so concurrent requests can't both
// pass the cap check before either write lands.
export async function checkAndIncrementUsage(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin.rpc("increment_ai_usage", { p_user_id: userId });
  if (error) throw error;
  return (data as number) <= DAILY_AI_LIMIT;
}
