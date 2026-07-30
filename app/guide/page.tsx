"use client";

import { useState } from "react";
import Link from "next/link";
import { C } from "@/lib/constants";
import { GoldButton } from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function GuidePage() {
  const { user, loading: authLoading } = useAuth();
  const [passage, setPassage] = useState("");
  const [group, setGroup] = useState("A mixed group of adults, different backgrounds, some new to the Bible");
  const [guide, setGuide] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!passage.trim() || busy) return;
    setBusy(true);
    setError(null);
    setGuide(null);
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage, group }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setGuide(data.guide);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t generate the guide just now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  if (!authLoading && !user) {
    return (
      <div className="rounded-2xl px-6 py-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: C.ink }} className="mb-2">
          Sign in to create a study guide.
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
    <div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
        A discussion guide in under a minute.
      </h2>
      <p className="text-sm mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        For small group leaders: name a passage or topic, describe your group, and get questions
        that move from the text to its world to your circle.
      </p>

      <label className="block text-xs font-semibold mb-1" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        Passage or topic
      </label>
      <input
        value={passage}
        onChange={(e) => setPassage(e.target.value)}
        placeholder="e.g. Luke 15:11–32, or “forgiveness”"
        className="w-full rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none"
        style={{ fontFamily: "'Albert Sans', sans-serif", background: C.white, border: `1px solid ${C.border}`, color: C.ink }}
      />

      <label className="block text-xs font-semibold mb-1" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        Who’s in the group?
      </label>
      <input
        value={group}
        onChange={(e) => setGroup(e.target.value)}
        className="w-full rounded-xl px-4 py-2.5 text-sm mb-5 focus:outline-none"
        style={{ fontFamily: "'Albert Sans', sans-serif", background: C.white, border: `1px solid ${C.border}`, color: C.ink }}
      />

      <GoldButton onClick={generate} disabled={busy || !passage.trim()}>
        {busy ? "Writing your guide…" : "Create study guide"}
      </GoldButton>

      {error && <p className="mt-4 text-sm" style={{ color: "#8A3B2E", fontFamily: "'Albert Sans', sans-serif" }}>{error}</p>}

      {guide && (
        <div
          className="mt-6 rounded-2xl px-5 py-5 whitespace-pre-wrap leading-relaxed text-[15px]"
          style={{ fontFamily: "'Lora', serif", background: C.card, border: `1px solid ${C.border}`, color: C.ink }}
        >
          {guide}
        </div>
      )}
    </div>
  );
}
