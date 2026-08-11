"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { C, HIGHLIGHTS } from "@/lib/constants";
import { GoldButton } from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

type JournalEntry = { id: number; text: string; created_at: string; shared_with_table_id: number | null };
type TableOption = { id: number; name: string };
type MarkRow = {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  color: string | null;
  note: string | null;
  verse_text: string | null;
};

export default function JournalPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [marks, setMarks] = useState<MarkRow[]>([]);
  const [draft, setDraft] = useState("");
  const [shareTableId, setShareTableId] = useState<number | "">("");
  const [tables, setTables] = useState<TableOption[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      if (!user) {
        setLoaded(true);
        return;
      }
      const supabase = createClient();
      const [entriesRes, marksRes, tablesRes] = await Promise.all([
        supabase
          .from("journal_entries")
          .select("id, text, created_at, shared_with_table_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("marks").select("id, book, chapter, verse, color, note, verse_text").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("table_members").select("role, tables(id, name)").eq("user_id", user.id),
      ]);
      setEntries(entriesRes.data ?? []);
      setMarks(marksRes.data ?? []);
      setTables(
        (tablesRes.data ?? [])
          .map((r) => {
            const t = Array.isArray(r.tables) ? r.tables[0] : r.tables;
            return t ? { id: t.id, name: t.name } : null;
          })
          .filter((t): t is TableOption => t !== null)
      );
      setLoaded(true);
    })();
  }, [user, authLoading]);

  function openReading(book: string, chapter: number) {
    router.push(`/read?book=${encodeURIComponent(book)}&chapter=${chapter}`);
  }

  async function removeMark(id: number) {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("marks").delete().eq("id", id).eq("user_id", user.id);
    setMarks(marks.filter((m) => m.id !== id));
  }

  async function addEntry() {
    if (!draft.trim() || !user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("journal_entries")
      .insert({ user_id: user.id, text: draft.trim(), shared_with_table_id: shareTableId || null })
      .select("id, text, created_at, shared_with_table_id")
      .single();
    if (data) setEntries([data, ...entries]);
    setDraft("");
    setShareTableId("");
  }

  async function removeEntry(id: number) {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", user.id);
    setEntries(entries.filter((e) => e.id !== id));
  }

  async function setEntrySharing(id: number, tableId: number | null) {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("journal_entries").update({ shared_with_table_id: tableId }).eq("id", id).eq("user_id", user.id);
    setEntries(entries.map((e) => (e.id === id ? { ...e, shared_with_table_id: tableId } : e)));
  }

  if (!authLoading && !user) {
    return (
      <div className="rounded-2xl px-6 py-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: C.ink }} className="mb-2">
          Sign in to keep your journal.
        </h2>
        <p className="text-sm mb-4" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
          Your highlights, verse notes, and journal entries are saved to your account.
        </p>
        <Link href="/login">
          <GoldButton>Sign in</GoldButton>
        </Link>
      </div>
    );
  }

  if (!loaded) {
    return (
      <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
        Loading your journal…
      </p>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
        Keep what you’re learning.
      </h2>
      <p className="text-sm mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        Your highlights, verse notes, and journal — all in one place, saved just for you.
      </p>

      {marks.length > 0 && (
        <div className="mb-8">
          <h3
            className="text-xs font-semibold mb-3"
            style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            Highlights & verse notes
          </h3>
          <div className="space-y-2">
            {marks.map((m) => (
              <div key={m.id} className="rounded-2xl px-4 py-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2 mb-1">
                  {m.color && (
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: HIGHLIGHTS[m.color], border: `1px solid ${C.border}` }} />
                  )}
                  <p className="text-xs font-semibold flex-1" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                    {m.book} {m.chapter}:{m.verse}
                  </p>
                  <button
                    onClick={() => openReading(m.book, m.chapter)}
                    className="text-[11px] font-semibold focus:outline-none"
                    style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
                  >
                    Open →
                  </button>
                  <button
                    onClick={() => removeMark(m.id)}
                    className="text-[11px] focus:outline-none"
                    style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
                  >
                    Delete
                  </button>
                </div>
                {m.verse_text && (
                  <p className="text-sm italic mb-1" style={{ fontFamily: "'Lora', serif", color: C.inkSoft }}>
                    “{m.verse_text}
                    {m.verse_text.length >= 140 ? "…" : ""}”
                  </p>
                )}
                {m.note && (
                  <p className="text-[15px] leading-relaxed" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
                    {m.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <h3
        className="text-xs font-semibold mb-3"
        style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}
      >
        Journal
      </h3>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="What stood out to you today?"
        rows={4}
        className="w-full rounded-xl px-4 py-3 text-[15px] mb-3 focus:outline-none leading-relaxed"
        style={{ fontFamily: "'Lora', serif", background: C.white, border: `1px solid ${C.border}`, color: C.ink }}
      />
      {tables.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
            Share with:
          </label>
          <select
            value={shareTableId}
            onChange={(e) => setShareTableId(e.target.value ? Number(e.target.value) : "")}
            className="rounded-lg px-2 py-1 text-xs focus:outline-none"
            style={{ fontFamily: "'Albert Sans', sans-serif", background: C.white, border: `1px solid ${C.border}`, color: C.ink }}
          >
            <option value="">Keep private</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <GoldButton onClick={addEntry} disabled={!draft.trim()}>
        Save entry
      </GoldButton>

      <div className="mt-8 space-y-4">
        {entries.length === 0 && (
          <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
            Your first entry will appear here.
          </p>
        )}
        {entries.map((e) => {
          const sharedTable = tables.find((t) => t.id === e.shared_with_table_id);
          return (
            <div key={e.id} className="rounded-2xl px-5 py-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-semibold" style={{ color: C.gold, fontFamily: "'Albert Sans', sans-serif" }}>
                  {new Date(e.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                </p>
                <button
                  onClick={() => removeEntry(e.id)}
                  className="text-[11px] focus:outline-none"
                  style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}
                >
                  Delete
                </button>
              </div>
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap mb-2" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
                {e.text}
              </p>
              {sharedTable ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px]" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}>
                    Shared with {sharedTable.name}
                  </span>
                  <button
                    onClick={() => setEntrySharing(e.id, null)}
                    className="text-[11px] focus:outline-none"
                    style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
                  >
                    Make private
                  </button>
                </div>
              ) : (
                tables.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {tables.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setEntrySharing(e.id, t.id)}
                        className="text-[11px] focus:outline-none"
                        style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
                      >
                        Share with {t.name}
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
