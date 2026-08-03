// Seeds plans + plan_days from scripts/plans-data.ts.
// Requires scripts/plans-schema.sql to have been run first.
// Usage: npm run seed:plans

import { config } from "dotenv";
config({ path: ".env.local" });
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS } from "./plans-data";

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exitCode = 1;
    return;
  }
  const supabase = createAdminClient();

  const planRows = PLANS.map((p) => ({
    id: p.id,
    title: p.title,
    blurb: p.blurb,
    category: p.category,
    tags: p.tags,
    total_days: p.days.length,
    sort_order: p.sortOrder,
  }));

  const { error: plansError } = await supabase.from("plans").upsert(planRows, { onConflict: "id" });
  if (plansError) throw plansError;
  console.log(`Seeded ${planRows.length} plans.`);

  for (const plan of PLANS) {
    const dayRows = plan.days.map((d, i) => ({
      plan_id: plan.id,
      day_index: i,
      label: d.label,
      book: d.book,
      chapter: d.chapter,
      devotional: d.devotional,
      reflection_prompt: d.reflection,
      guided_prayer: d.guidedPrayer ?? null,
    }));
    const { error } = await supabase.from("plan_days").upsert(dayRows, { onConflict: "plan_id,day_index" });
    if (error) throw error;
    console.log(`  ${plan.id}: ${dayRows.length} days`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
