import type { SupabaseClient } from "@supabase/supabase-js";

export const DAILY_AI_LIMIT = 20;
// Anonymous sessions (no sign-in required to try the Companion/Guide) get a lower
// cap — plenty to sample the product, while keeping cost-per-anonymous-visitor bounded.
export const DAILY_AI_LIMIT_ANONYMOUS = 5;

// Atomically increments today's usage row and reports whether the caller is still
// within their limit. Uses the increment_ai_usage() Postgres function
// (scripts/increment-ai-usage-function.sql) so concurrent requests can't both pass
// the cap check before either write lands.
export async function checkAndIncrementUsage(admin: SupabaseClient, userId: string, limit: number) {
  const { data, error } = await admin.rpc("increment_ai_usage", { p_user_id: userId });
  if (error) throw error;
  return (data as number) <= limit;
}
