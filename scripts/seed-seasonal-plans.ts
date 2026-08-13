// Seeds Advent and Holy Week from scripts/seasonal-plans-data.ts.
// Requires scripts/seasonal-plans-schema.sql to have been run first.
// Usage: npm run seed:seasonal

import { config } from "dotenv";
config({ path: ".env.local" });
import { createAdminClient } from "@/lib/supabase/admin";
import { SEASONAL_PLANS } from "./seasonal-plans-data";

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exitCode = 1;
    return;
  }
  const supabase = createAdminClient();

  const planRows = SEASONAL_PLANS.map((p) => ({
    id: p.id,
    title: p.title,
    blurb: p.blurb,
    category: "seasonal",
    tags: p.tags,
    total_days: p.days.length,
    sort_order: p.sortOrder,
    season_key: p.seasonKey,
  }));

  const { error: plansError } = await supabase.from("plans").upsert(planRows, { onConflict: "id" });
  if (plansError) throw plansError;
  console.log(`Seeded ${planRows.length} seasonal plans.`);

  for (const plan of SEASONAL_PLANS) {
    const dayRows = plan.days.map((d, i) => ({
      plan_id: plan.id,
      day_index: i,
      label: d.label,
      book: d.book,
      chapter: d.chapter,
      devotional: d.devotional,
      reflection_prompt: d.reflection,
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
