import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { askClaude, type ChatMessage } from "@/lib/anthropic";
import { gatherSources } from "@/lib/sources";
import { COMPANION_SYSTEM } from "@/lib/prompts";
import { checkAndIncrementUsage } from "@/lib/usage";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to use the Companion." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMessage) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
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
    const history = messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
    const { sources, sourceBlock } = await gatherSources(supabase, lastUserMessage.content, history);
    const reply = await askClaude(COMPANION_SYSTEM, messages, { sourceBlock });
    return NextResponse.json({ reply, sources });
  } catch (err) {
    console.error("companion route error", err);
    return NextResponse.json(
      { error: "The Companion couldn’t respond just now. Try again in a moment." },
      { status: 500 }
    );
  }
}
