"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ALL_BOOKS, C, HIGHLIGHTS, OT, NT, TRANSLATIONS } from "@/lib/constants";
import { GoldButton, selectStyle } from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type VerseRow = { verse: number; text: string };
type Mark = { color: string | null; note: string | null; verse_text: string | null };

export function ReadClient() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabase = createClient();

  const [book, setBook] = useState(searchParams.get("book") || "John");
  const [chapter, setChapter] = useState(Number(searchParams.get("chapter")) || 1);
  const [translation, setTranslation] = useState("web");
  const [verses, setVerses] = useState<VerseRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [marks, setMarks] = useState<Record<number, Mark>>({});
  const [noteDraft, setNoteDraft] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);

  // Honor a book/chapter passed in the URL (from Today, Plans, or Journal).
  useEffect(() => {
    function syncFromUrl() {
      const b = searchParams.get("book");
      const c = searchParams.get("chapter");
      if (b) setBook(b);
      if (c) setChapter(Number(c));
    }
    syncFromUrl();
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setSelected(null);
      setNoteOpen(false);
      setVerses(null);
      const { data } = await supabase
        .from("verses")
        .select("verse, text")
        .eq("translation", translation)
        .eq("book", book)
        .eq("chapter", chapter)
        .order("verse", { ascending: true });
      if (cancelled) return;
      setVerses(data ?? []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapter, translation]);

  useEffect(() => {
    let cancelled = false;
    async function loadMarks() {
      if (!user) {
        setMarks({});
        return;
      }
      const { data } = await supabase
        .from("marks")
        .select("verse, color, note, verse_text")
        .eq("user_id", user.id)
        .eq("book", book)
        .eq("chapter", chapter);
      if (cancelled) return;
      const next: Record<number, Mark> = {};
      for (const row of data ?? []) {
        next[row.verse] = { color: row.color, note: row.note, verse_text: row.verse_text };
      }
      setMarks(next);
    }
    loadMarks();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, book, chapter]);

  const bookInfo = ALL_BOOKS.find(([b]) => b === book);
  const chapterCount = bookInfo ? bookInfo[1] : 1;
  const currentMark = selected != null ? marks[selected] : null;

  function selectVerse(num: number) {
    if (selected === num) {
      setSelected(null);
      setNoteOpen(false);
      return;
    }
    setSelected(num);
    const m = marks[num];
    setNoteDraft(m?.note || "");
    setNoteOpen(Boolean(m?.note));
  }

  async function setHighlight(color: string) {
    if (selected == null || !user) return;
    const existing = marks[selected];
    const verseText = verses?.find((v) => v.verse === selected)?.text || "";

    if (existing?.color === color) {
      if (existing.note) {
        await supabase
          .from("marks")
          .update({ color: null })
          .eq("user_id", user.id)
          .eq("book", book)
          .eq("chapter", chapter)
          .eq("verse", selected);
        setMarks({ ...marks, [selected]: { ...existing, color: null } });
      } else {
        await supabase
          .from("marks")
          .delete()
          .eq("user_id", user.id)
          .eq("book", book)
          .eq("chapter", chapter)
          .eq("verse", selected);
        const next = { ...marks };
        delete next[selected];
        setMarks(next);
      }
      return;
    }

    await supabase
      .from("marks")
      .upsert(
        {
          user_id: user.id,
          book,
          chapter,
          verse: selected,
          color,
          note: existing?.note ?? null,
          verse_text: verseText.slice(0, 140),
        },
        { onConflict: "user_id,book,chapter,verse" }
      );
    setMarks({ ...marks, [selected]: { color, note: existing?.note ?? null, verse_text: verseText.slice(0, 140) } });
  }

  async function saveNote() {
    if (selected == null || !user) return;
    const existing = marks[selected];
    const trimmed = noteDraft.trim();
    const verseText = verses?.find((v) => v.verse === selected)?.text || "";

    if (trimmed) {
      await supabase.from("marks").upsert(
        {
          user_id: user.id,
          book,
          chapter,
          verse: selected,
          color: existing?.color ?? null,
          note: trimmed,
          verse_text: verseText.slice(0, 140),
        },
        { onConflict: "user_id,book,chapter,verse" }
      );
      setMarks({ ...marks, [selected]: { color: existing?.color ?? null, note: trimmed, verse_text: verseText.slice(0, 140) } });
    } else if (existing?.color) {
      await supabase
        .from("marks")
        .update({ note: null })
        .eq("user_id", user.id)
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("verse", selected);
      setMarks({ ...marks, [selected]: { ...existing, note: null } });
    } else {
      await supabase
        .from("marks")
        .delete()
        .eq("user_id", user.id)
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("verse", selected);
      const next = { ...marks };
      delete next[selected];
      setMarks(next);
      setNoteOpen(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={book}
          onChange={(e) => {
            setBook(e.target.value);
            setChapter(1);
          }}
          className="rounded-xl px-3 py-2 text-sm focus:outline-none"
          style={selectStyle}
        >
          <optgroup label="Hebrew Bible / Old Testament">
            {OT.map(([b]) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </optgroup>
          <optgroup label="New Testament">
            {NT.map(([b]) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </optgroup>
        </select>
        <select
          value={chapter}
          onChange={(e) => setChapter(Number(e.target.value))}
          className="rounded-xl px-3 py-2 text-sm focus:outline-none"
          style={selectStyle}
        >
          {Array.from({ length: chapterCount }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Chapter {n}
            </option>
          ))}
        </select>
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
      </div>

      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: C.ink }} className="mb-1">
        {book} {chapter}
      </h2>
      <p className="text-xs mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        {TRANSLATIONS.find(([c]) => c === translation)?.[1]}
        {verses && verses.length > 0 && (user ? " · tap a verse to highlight, note, or ask" : " · sign in to highlight and take notes")}
      </p>

      {loading && (
        <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
          Turning the pages…
        </p>
      )}

      {!loading && verses && verses.length === 0 && (
        <div className="rounded-2xl px-5 py-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[15px] leading-relaxed" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
            This chapter hasn’t been imported yet. Run the verse import script to load WEB, KJV,
            and ASV text into Supabase.
          </p>
        </div>
      )}

      {!loading && verses && verses.length > 0 && (
        <div className="space-y-1 mb-4">
          {verses.map((v) => {
            const mark = marks[v.verse];
            const isSelected = selected === v.verse;
            return (
              <p
                key={v.verse}
                onClick={() => selectVerse(v.verse)}
                className="cursor-pointer rounded-lg px-3 py-2 transition-colors leading-relaxed"
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: 17,
                  color: C.ink,
                  background: isSelected ? C.goldSoft : mark?.color ? HIGHLIGHTS[mark.color] : "transparent",
                  outline: isSelected ? `1px solid ${C.gold}` : "none",
                }}
              >
                <sup className="mr-2 font-sans" style={{ color: C.gold, fontSize: 11 }}>
                  {v.verse}
                </sup>
                {v.text}
                {mark?.note && (
                  <span className="ml-2" style={{ color: C.gold, fontSize: 13 }} title="Has a note">
                    ✎
                  </span>
                )}
              </p>
            );
          })}
        </div>
      )}

      {selected != null && verses && (
        <div className="sticky bottom-3 rounded-2xl px-4 py-4 shadow-lg" style={{ background: C.white, border: `1px solid ${C.border}` }}>
          {!user ? (
            <p className="text-sm" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
              <Link href="/login" style={{ color: C.gold, fontWeight: 600 }}>
                Sign in
              </Link>{" "}
              to highlight verses and save notes.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <p className="text-xs font-semibold" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                  {book} {chapter}:{selected}
                </p>
                <div className="flex items-center gap-2">
                  {Object.entries(HIGHLIGHTS).map(([name, hex]) => (
                    <button
                      key={name}
                      onClick={() => setHighlight(name)}
                      aria-label={`Highlight ${name}`}
                      className="w-6 h-6 rounded-full focus:outline-none"
                      style={{
                        background: hex,
                        border: currentMark?.color === name ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                      }}
                    />
                  ))}
                  {currentMark?.color && (
                    <button
                      onClick={() => setHighlight(currentMark.color!)}
                      className="text-[11px] focus:outline-none"
                      style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex-1" />
                <button
                  onClick={() => setNoteOpen(!noteOpen)}
                  className="text-xs font-semibold focus:outline-none"
                  style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
                >
                  {noteOpen ? "Hide note" : currentMark?.note ? "Edit note" : "＋ Add note"}
                </button>
                <Link
                  href={`/companion?seed=${encodeURIComponent(
                    `${book} ${chapter}:${selected} — “${verses.find((v) => v.verse === selected)?.text}” — can you help me understand this verse?`
                  )}`}
                  className="text-xs font-semibold focus:outline-none"
                  style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
                >
                  Ask the Companion
                </Link>
              </div>

              {noteOpen && (
                <div className="mt-3">
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Your thought on this verse…"
                    rows={3}
                    className="w-full rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none leading-relaxed"
                    style={{ fontFamily: "'Lora', serif", background: C.paper, border: `1px solid ${C.border}`, color: C.ink }}
                  />
                  <GoldButton onClick={saveNote}>Save note</GoldButton>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="flex justify-between mt-10">
        <button
          onClick={() => setChapter(Math.max(1, chapter - 1))}
          disabled={chapter === 1}
          className="text-sm focus:outline-none"
          style={{ fontFamily: "'Albert Sans', sans-serif", color: chapter === 1 ? C.border : C.inkSoft }}
        >
          ← Previous chapter
        </button>
        <button
          onClick={() => setChapter(Math.min(chapterCount, chapter + 1))}
          disabled={chapter === chapterCount}
          className="text-sm focus:outline-none"
          style={{ fontFamily: "'Albert Sans', sans-serif", color: chapter === chapterCount ? C.border : C.inkSoft }}
        >
          Next chapter →
        </button>
      </div>
    </div>
  );
}
