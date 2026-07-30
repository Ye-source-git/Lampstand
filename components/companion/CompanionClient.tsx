"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { C } from "@/lib/constants";
import { GoldButton } from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthProvider";

type Source = { id: string; kind: string; label: string };
type Message = { role: "user" | "assistant"; content: string; sources?: Source[] };

const starters = [
  "What is the Bible, and how is it organized?",
  "What does “blessed are the poor in spirit” mean?",
  "How do different traditions read Genesis 1?",
  "I’m new to all of this. Where should I start?",
];

export function CompanionClient() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seedHandled = useRef(false);

  useEffect(() => {
    const seed = searchParams.get("seed");
    if (seed && !seedHandled.current && !authLoading) {
      seedHandled.current = true;
      send(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, authLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setError(null);
    setInput("");
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages([...next, { role: "assistant", content: data.reply, sources: data.sources }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The Companion couldn’t respond just now. Try again in a moment.");
      setMessages(messages);
    } finally {
      setBusy(false);
    }
  }

  if (!authLoading && !user) {
    return (
      <div className="rounded-2xl px-6 py-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: C.ink }} className="mb-2">
          Sign in to talk with the Companion.
        </h2>
        <p className="text-sm mb-4" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
          This keeps the study tool free and abuse-resistant for everyone.
        </p>
        <Link href="/login">
          <GoldButton>Sign in</GoldButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 480 }}>
      {messages.length === 0 && (
        <div className="mb-6">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
            Ask anything, from anywhere you’re starting.
          </h2>
          <p className="text-sm mb-4" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
            The Companion explains passages, history, and context — and where traditions differ, it
            shows you the range of views rather than picking one for you. When you ask about a
            passage, it reads the actual text plus study notes and cross-references, and shows you
            the sources it drew on.
          </p>
          <div className="flex flex-wrap gap-2">
            {starters.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-3 py-2 rounded-xl text-left text-sm focus:outline-none"
                style={{ fontFamily: "'Albert Sans', sans-serif", background: C.card, border: `1px solid ${C.border}`, color: C.ink }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-full sm:max-w-xl">
              <div
                className="rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap"
                style={{
                  fontFamily: m.role === "user" ? "'Albert Sans', sans-serif" : "'Lora', serif",
                  background: m.role === "user" ? C.deep : C.card,
                  color: m.role === "user" ? C.white : C.ink,
                  border: m.role === "user" ? "none" : `1px solid ${C.border}`,
                }}
              >
                {m.content}
              </div>
              {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                <div className="mt-2 rounded-xl px-3 py-2" style={{ background: C.goldSoft, border: `1px solid ${C.border}` }}>
                  <p
                    className="text-[10px] font-semibold mb-1"
                    style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}
                  >
                    Sources consulted
                  </p>
                  {m.sources.map((s) => (
                    <p key={s.id} className="text-[11px] leading-relaxed" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                      <span style={{ color: C.gold, fontWeight: 600 }}>[{s.id}]</span> {s.label} · {s.kind}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
            The Companion is reflecting…
          </p>
        )}
        {error && <p className="text-sm" style={{ color: "#8A3B2E", fontFamily: "'Albert Sans', sans-serif" }}>{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about a verse, a word, a story, a question…"
          className="flex-1 rounded-full px-4 py-2.5 text-sm focus:outline-none"
          style={{ fontFamily: "'Albert Sans', sans-serif", background: C.white, border: `1px solid ${C.border}`, color: C.ink }}
        />
        <GoldButton onClick={() => send()} disabled={busy || !input.trim()}>
          Ask
        </GoldButton>
      </div>
      <p className="mt-3 text-[11px]" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        A study tool, not a spiritual authority — for personal decisions, talk with people you trust in your own community.
      </p>
    </div>
  );
}
