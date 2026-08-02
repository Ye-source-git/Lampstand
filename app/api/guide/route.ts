import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { askClaude } from "@/lib/anthropic";
import { GUIDE_SYSTEM } from "@/lib/prompts";
import { checkAndIncrementUsage, DAILY_AI_LIMIT, DAILY_AI_LIMIT_ANONYMOUS } from "@/lib/usage";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to generate a study guide." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const passage = typeof body?.passage === "string" ? body.passage.trim() : "";
  const group = typeof body?.group === "string" ? body.group.trim() : "";
  if (!passage) {
    return NextResponse.json({ error: "Enter a passage or topic." }, { status: 400 });
  }

  const admin = createAdminClient();
  const limit = user.is_anonymous ? DAILY_AI_LIMIT_ANONYMOUS : DAILY_AI_LIMIT;
  const withinLimit = await checkAndIncrementUsage(admin, user.id, limit);
  if (!withinLimit) {
    const message = user.is_anonymous
      ? "You’ve reached today’s limit for trying the Study Guide without an account. Sign in to get a higher daily limit."
      : "You’ve reached today’s question limit. Please try again tomorrow.";
    return NextResponse.json({ error: message }, { status: 429 });
  }

  try {
    const guide = await askClaude(GUIDE_SYSTEM, [
      { role: "user", content: `Passage or topic: ${passage}\nGroup: ${group}` },
    ]);
    return NextResponse.json({ guide });
  } catch (err) {
    console.error("guide route error", err);
    return NextResponse.json(
      { error: "Couldn’t generate the guide just now. Try again in a moment." },
      { status: 500 }
    );
  }
}
