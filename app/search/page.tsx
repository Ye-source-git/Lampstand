"use client";

import { useState } from "react";
import Link from "next/link";
import { C, TRANSLATIONS } from "@/lib/constants";
import { GoldButton, selectStyle } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

type Result = { book: string; chapter: number; verse: number; text: string; rank: number };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [translation, setTranslation] = useState("web");
  const [results, setResults] = useState<Result[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch() {
    const q = query.trim();
    if (!q || busy) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("search_verses", {
      query: q,
      p_translation: translation,
      p_limit: 40,
    });
    setBusy(false);
    if (error) {
      setError("Search couldn’t run just now. Try again in a moment.");
      return;
    }
    setResults(data ?? []);
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
        Search the Bible.
      </h2>
      <p className="text-sm mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        Find where a word, name, or phrase appears.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="e.g. good shepherd, Nicodemus, fruit of the Spirit…"
          className="flex-1 min-w-[220px] rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          style={{ fontFamily: "'Albert Sans', sans-serif", background: C.white, border: `1px solid ${C.border}`, color: C.ink }}
        />
        <select
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm focus:outline-none"
          style={selectStyle}
        >
          {TRANSLATIONS.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <GoldButton onClick={runSearch} disabled={busy || !query.trim()}>
          {busy ? "Searching…" : "Search"}
        </GoldButton>
      </div>

      {error && <p className="text-sm mb-4" style={{ color: "#8A3B2E", fontFamily: "'Albert Sans', sans-serif" }}>{error}</p>}

      {results && results.length === 0 && !error && (
        <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
          No verses found for “{query}.”
        </p>
      )}

      {results && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
            {results.length} result{results.length === 1 ? "" : "s"}
          </p>
          {results.map((r) => (
            <Link
              key={`${r.book}-${r.chapter}-${r.verse}`}
              href={`/read?book=${encodeURIComponent(r.book)}&chapter=${r.chapter}&verse=${r.verse}`}
              className="block rounded-2xl px-4 py-3 focus:outline-none"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <p className="text-xs font-semibold mb-1" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}>
                {r.book} {r.chapter}:{r.verse}
              </p>
              <p className="text-[15px] leading-relaxed" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
                {r.text}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
