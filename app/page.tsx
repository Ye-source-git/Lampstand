"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND, C, todaysVerse } from "@/lib/constants";
import { GoldButton } from "@/components/ui";
import { ShareVerseButton } from "@/components/ShareVerseButton";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { isInSeason, SeasonKey } from "@/lib/seasons";

type Resume = {
  planId: string;
  planTitle: string;
  totalDays: number;
  nextDay: { day_index: number; label: string; book: string; chapter: number };
};

type SeasonalPlan = { id: string; title: string; blurb: string; totalDays: number };

export default function TodayPage() {
  const verse = todaysVerse();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [resume, setResume] = useState<Resume[]>([]);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [seasonalPlan, setSeasonalPlan] = useState<SeasonalPlan | null>(null);

  // Seasonal plans (Advent, Holy Week) are always available under Plans, but
  // are only promoted here — front and center — during their actual real-
  // world date window, computed fresh each time rather than stored.
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("plans").select("id, title, blurb, total_days, season_key").not("season_key", "is", null);
      const active = (data ?? []).find((p) => p.season_key && isInSeason(p.season_key as SeasonKey));
      setSeasonalPlan(active ? { id: active.id, title: active.title, blurb: active.blurb, totalDays: active.total_days } : null);
    })();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      if (!user) {
        setResume([]);
        setResumeLoading(false);
        return;
      }
      const supabase = createClient();
      const { data: progressRows } = await supabase
        .from("plan_progress")
        .select("plan_id, day_index")
        .eq("user_id", user.id);

      const byPlan = new Map<string, Set<number>>();
      for (const row of progressRows ?? []) {
        if (!byPlan.has(row.plan_id)) byPlan.set(row.plan_id, new Set());
        byPlan.get(row.plan_id)!.add(row.day_index);
      }

      const activePlanIds = [...byPlan.keys()];
      if (activePlanIds.length === 0) {
        setResume([]);
        setResumeLoading(false);
        return;
      }

      const [{ data: planRows }, { data: dayRows }] = await Promise.all([
        supabase.from("plans").select("id, title, total_days").in("id", activePlanIds),
        supabase.from("plan_days").select("plan_id, day_index, label, book, chapter").in("plan_id", activePlanIds),
      ]);

      const daysByPlan = new Map<string, typeof dayRows>();
      for (const d of dayRows ?? []) {
        if (!daysByPlan.has(d.plan_id)) daysByPlan.set(d.plan_id, []);
        daysByPlan.get(d.plan_id)!.push(d);
      }

      const items: Resume[] = [];
      for (const plan of planRows ?? []) {
        const done = byPlan.get(plan.id) ?? new Set<number>();
        if (done.size === 0 || done.size >= plan.total_days) continue;
        const days = (daysByPlan.get(plan.id) ?? []).sort((a, b) => a.day_index - b.day_index);
        const nextDay = days.find((d) => !done.has(d.day_index));
        if (nextDay) items.push({ planId: plan.id, planTitle: plan.title, totalDays: plan.total_days, nextDay });
      }
      setResume(items);
      setResumeLoading(false);
    })();
  }, [user, authLoading]);

  function openReading(book: string, chapter: number) {
    router.push(`/read?book=${encodeURIComponent(book)}&chapter=${chapter}`);
  }

  function askAbout(prompt: string) {
    router.push(`/companion?seed=${encodeURIComponent(prompt)}`);
  }

  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <p
        className="text-xs mb-6"
        style={{ color: C.gold, fontFamily: "'Albert Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}
      >
        {dateStr}
      </p>

      <div className="rounded-3xl px-6 py-8 sm:px-10 sm:py-10 mb-8" style={{ background: BRAND.deep }}>
        <p
          className="text-xs mb-4"
          style={{ color: BRAND.goldSoft, fontFamily: "'Albert Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          Verse for today
        </p>
        <p className="leading-relaxed mb-5" style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: BRAND.white }}>
          “{verse.text}”
        </p>
        <p className="text-sm mb-6" style={{ fontFamily: "'Albert Sans', sans-serif", color: BRAND.goldSoft }}>
          {verse.ref} · World English Bible
        </p>
        <div className="flex flex-wrap gap-2">
          <GoldButton onClick={() => openReading(verse.book, verse.chapter)}>Read the chapter</GoldButton>
          <button
            onClick={() =>
              askAbout(`${verse.ref} — “${verse.text}” — can you help me understand this verse and its context?`)
            }
            className="px-4 py-2 rounded-full text-sm font-semibold focus:outline-none"
            style={{ fontFamily: "'Albert Sans', sans-serif", background: "transparent", border: `1px solid ${BRAND.goldSoft}`, color: BRAND.goldSoft }}
          >
            Ask about this verse
          </button>
          <ShareVerseButton
            reference={verse.ref}
            text={verse.text}
            translationName="World English Bible"
            className="px-4 py-2 rounded-full text-sm font-semibold focus:outline-none"
            style={{ fontFamily: "'Albert Sans', sans-serif", background: "transparent", border: `1px solid ${BRAND.goldSoft}`, color: BRAND.goldSoft }}
          >
            Share
          </ShareVerseButton>
        </div>
      </div>

      {seasonalPlan && (
        <div className="rounded-2xl px-5 py-4 mb-8" style={{ background: C.goldSoft, border: `1px solid ${C.gold}` }}>
          <p
            className="text-[11px] font-semibold mb-1"
            style={{ fontFamily: "'Albert Sans', sans-serif", color: C.deep, letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Happening now
          </p>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: C.ink }} className="mb-1">
            {seasonalPlan.title}
          </p>
          <p className="text-sm mb-3" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
            {seasonalPlan.blurb}
          </p>
          <button
            onClick={() => router.push("/plans")}
            className="text-sm font-semibold focus:outline-none"
            style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
          >
            Open the plan →
          </button>
        </div>
      )}

      {resumeLoading ? (
        <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
          Loading your plans…
        </p>
      ) : resume.length > 0 ? (
        <div>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: C.ink }} className="mb-3">
            Pick up where you left off
          </h3>
          <div className="space-y-2">
            {resume.map(({ planId, planTitle, totalDays, nextDay }) => (
              <div key={planId} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px]" style={{ fontFamily: "'Lora', serif", color: C.ink }}>{planTitle}</p>
                  <p className="text-xs" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                    Day {nextDay.day_index + 1} of {totalDays} · {nextDay.label} ({nextDay.book} {nextDay.chapter})
                  </p>
                </div>
                <button
                  onClick={() => openReading(nextDay.book, nextDay.chapter)}
                  className="text-xs font-semibold focus:outline-none flex-shrink-0"
                  style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
                >
                  Read →
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl px-5 py-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[15px] mb-1" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
            A little each day goes a long way.
          </p>
          <button
            onClick={() => router.push("/plans")}
            className="text-sm font-semibold focus:outline-none"
            style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
          >
            Start a reading plan →
          </button>
        </div>
      )}
    </div>
  );
}
