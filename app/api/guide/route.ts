import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { askClaude } from "@/lib/anthropic";
import { GUIDE_SYSTEM } from "@/lib/prompts";
import { checkAndIncrementUsage } from "@/lib/usage";

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
  const withinLimit = await checkAndIncrementUsage(admin, user.id);
  if (!withinLimit) {
    return NextResponse.json(
      { error: "You’ve reached today’s question limit. Please try again tomorrow." },
      { status: 429 }
    );
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
