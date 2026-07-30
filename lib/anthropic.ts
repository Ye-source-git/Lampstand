import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

// Static instructions go in a cached block; the per-request sources block stays
// uncached since it changes with every question.
export async function askClaude(
  staticSystem: string,
  messages: ChatMessage[],
  opts: { sourceBlock?: string; model?: string; maxTokens?: number } = {}
) {
  const anthropic = getClient();
  const system: Anthropic.Messages.TextBlockParam[] = [
    { type: "text", text: staticSystem, cache_control: { type: "ephemeral" } },
  ];
  if (opts.sourceBlock) {
    system.push({ type: "text", text: opts.sourceBlock });
  }

  const response = await anthropic.messages.create({
    model: opts.model ?? "claude-sonnet-4-5",
    max_tokens: opts.maxTokens ?? 1000,
    system,
    messages,
  });

  return response.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}
