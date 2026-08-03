"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { C } from "@/lib/constants";
import { GoldButton } from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

type Plan = {
  id: string;
  title: string;
  blurb: string;
  category: string;
  total_days: number;
};

type PlanDay = {
  day_index: number;
  label: string;
  book: string;
  chapter: number;
  devotional: string | null;
  reflection_prompt: string | null;
  guided_prayer: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  starter: "Getting Started",
  topical: "For Where You Are",
  "life-of-jesus": "The Life of Jesus",
  "whole-bible": "The Whole Story",
};
const CATEGORY_ORDER = ["starter", "topical", "life-of-jesus", "whole-bible"];

export default function PlansPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [progress, setProgress] = useState<Record<string, Set<number>>>({});
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);
  const [planDays, setPlanDays] = useState<PlanDay[] | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [reflectDay, setReflectDay] = useState<number | null>(null);
  const [reflectDraft, setReflectDraft] = useState("");
  const [reflectSaved, setReflectSaved] = useState<Set<number>>(new Set());
  const [prayerDay, setPrayerDay] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      const supabase = createClient();
      const { data: planRows } = await supabase
        .from("plans")
        .select("id, title, blurb, category, total_days")
        .order("sort_order", { ascending: true });
      setPlans(planRows ?? []);

      if (!user) {
        setProgress({});
        setLoaded(true);
        return;
      }
      const { data } = await supabase.from("plan_progress").select("plan_id, day_index").eq("user_id", user.id);
      const next: Record<string, Set<number>> = {};
      for (const row of data ?? []) {
        if (!next[row.plan_id]) next[row.plan_id] = new Set();
        next[row.plan_id].add(row.day_index);
      }
      setProgress(next);
      setLoaded(true);
    })();
  }, [user, authLoading]);

  async function openPlan(planId: string) {
    setOpenPlanId(planId);
    setPlanDays(null);
    setReflectDay(null);
    const supabase = createClient();
    const { data } = await supabase
      .from("plan_days")
      .select("day_index, label, book, chapter, devotional, reflection_prompt, guided_prayer")
      .eq("plan_id", planId)
      .order("day_index", { ascending: true });
    setPlanDays(data ?? []);
  }

  function openReading(book: string, chapter: number) {
    router.push(`/read?book=${encodeURIComponent(book)}&chapter=${chapter}`);
  }

  async function toggleDay(planId: string, dayIndex: number) {
    if (!user) return;
    const supabase = createClient();
    const done = new Set(progress[planId] || []);
    if (done.has(dayIndex)) {
      done.delete(dayIndex);
      await supabase.from("plan_progress").delete().eq("user_id", user.id).eq("plan_id", planId).eq("day_index", dayIndex);
    } else {
      done.add(dayIndex);
      await supabase.from("plan_progress").insert({ user_id: user.id, plan_id: planId, day_index: dayIndex });
    }
    setProgress({ ...progress, [planId]: done });
  }

  function openReflect(dayIndex: number) {
    setReflectDay(reflectDay === dayIndex ? null : dayIndex);
    setReflectDraft("");
  }

  function togglePrayer(dayIndex: number) {
    setPrayerDay(prayerDay === dayIndex ? null : dayIndex);
  }

  async function saveReflection(plan: Plan, day: PlanDay) {
    if (!user || !reflectDraft.trim()) return;
    const supabase = createClient();
    const text = `${plan.title} · Day ${day.day_index + 1}: ${day.label}\n\n${reflectDraft.trim()}`;
    await supabase.from("journal_entries").insert({ user_id: user.id, text });
    setReflectSaved(new Set([...reflectSaved, day.day_index]));
    setReflectDay(null);
    setReflectDraft("");
  }

  if (!loaded) {
    return (
      <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
        Loading your plans…
      </p>
    );
  }

  if (openPlanId) {
    const plan = plans.find((p) => p.id === openPlanId)!;
    const done = progress[plan.id] || new Set<number>();
    const pct = Math.round((done.size / plan.total_days) * 100);
    return (
      <div>
        <button
          onClick={() => setOpenPlanId(null)}
          className="text-sm mb-4 focus:outline-none"
          style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
        >
          ← All plans
        </button>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-1">
          {plan.title}
        </h2>
        <p className="text-sm mb-4" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
          {plan.blurb}
        </p>

        {!user && (
          <p className="text-sm mb-4" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
            <Link href="/login" style={{ color: C.gold, fontWeight: 600 }}>
              Sign in
            </Link>{" "}
            to track your progress and save reflections.
          </p>
        )}

        <div className="rounded-full h-2 mb-2" style={{ background: C.goldSoft }}>
          <div className="h-2 rounded-full transition-all" style={{ background: C.gold, width: `${pct}%` }} />
        </div>
        <p className="text-xs mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
          {done.size} of {plan.total_days} days · {pct}%
        </p>

        {!planDays && (
          <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
            Loading days…
          </p>
        )}

        <div className="space-y-3">
          {planDays?.map((day) => (
            <div key={day.day_index} className="rounded-2xl px-4 py-4" style={{ background: C.card, border: `1px solid ${C.border}`, opacity: done.has(day.day_index) ? 0.75 : 1 }}>
              <div className="flex items-start gap-3 mb-2">
                <button
                  onClick={() => toggleDay(plan.id, day.day_index)}
                  disabled={!user}
                  aria-label={done.has(day.day_index) ? "Mark day incomplete" : "Mark day complete"}
                  className="w-6 h-6 mt-0.5 rounded-full flex items-center justify-center text-xs focus:outline-none flex-shrink-0"
                  style={{
                    border: `2px solid ${done.has(day.day_index) ? C.gold : C.border}`,
                    background: done.has(day.day_index) ? C.gold : "transparent",
                    color: C.white,
                    fontFamily: "'Albert Sans', sans-serif",
                  }}
                >
                  {done.has(day.day_index) ? "✓" : ""}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[15px]"
                    style={{ fontFamily: "'Lora', serif", color: C.ink, textDecoration: done.has(day.day_index) ? "line-through" : "none" }}
                  >
                    Day {day.day_index + 1} · {day.label}
                  </p>
                  <p className="text-xs" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                    {day.book} {day.chapter}
                  </p>
                </div>
                <button
                  onClick={() => openReading(day.book, day.chapter)}
                  className="text-xs font-semibold focus:outline-none flex-shrink-0"
                  style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
                >
                  Read →
                </button>
              </div>

              {day.devotional && (
                <p className="text-sm leading-relaxed mb-2" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
                  {day.devotional}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {day.guided_prayer && (
                  <button
                    onClick={() => togglePrayer(day.day_index)}
                    className="text-xs font-semibold focus:outline-none"
                    style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
                  >
                    {prayerDay === day.day_index ? "Hide prayer" : "Pray"}
                  </button>
                )}
                {day.reflection_prompt && user && (
                  <button
                    onClick={() => openReflect(day.day_index)}
                    className="text-xs font-semibold focus:outline-none"
                    style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
                  >
                    {reflectSaved.has(day.day_index) ? "Reflection saved ✓" : reflectDay === day.day_index ? "Hide reflection" : "Reflect"}
                  </button>
                )}
                <Link
                  href={`/companion?seed=${encodeURIComponent(
                    `${day.book} ${day.chapter} — I'm reading this as part of the "${plan.title}" plan (day ${day.day_index + 1}: ${day.label}). Can you help me understand it?`
                  )}`}
                  className="text-xs font-semibold focus:outline-none"
                  style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
                >
                  Ask the Companion
                </Link>
              </div>

              {prayerDay === day.day_index && day.guided_prayer && (
                <p
                  className="text-sm leading-relaxed mt-3 rounded-xl px-3 py-2"
                  style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: C.ink, background: C.paper, border: `1px solid ${C.border}` }}
                >
                  {day.guided_prayer}
                </p>
              )}

              {reflectDay === day.day_index && day.reflection_prompt && (
                <div className="mt-3">
                  <p className="text-xs italic mb-2" style={{ fontFamily: "'Lora', serif", color: C.inkSoft }}>
                    {day.reflection_prompt}
                  </p>
                  <textarea
                    value={reflectDraft}
                    onChange={(e) => setReflectDraft(e.target.value)}
                    placeholder="Write your reflection…"
                    rows={3}
                    className="w-full rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none leading-relaxed"
                    style={{ fontFamily: "'Lora', serif", background: C.paper, border: `1px solid ${C.border}`, color: C.ink }}
                  />
                  <GoldButton onClick={() => saveReflection(plan, day)} disabled={!reflectDraft.trim()}>
                    Save to Journal
                  </GoldButton>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const byCategory = new Map<string, Plan[]>();
  for (const plan of plans) {
    if (!byCategory.has(plan.category)) byCategory.set(plan.category, []);
    byCategory.get(plan.category)!.push(plan);
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
        A little each day goes a long way.
      </h2>
      <p className="text-sm mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        Pick a plan, read one short passage a day, and your progress is saved as you go.
      </p>

      {CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => (
        <div key={category} className="mb-8">
          <h3
            className="text-xs font-semibold mb-3"
            style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            {CATEGORY_LABELS[category] ?? category}
          </h3>
          <div className="space-y-3">
            {byCategory.get(category)!.map((plan) => {
              const done = (progress[plan.id] || new Set()).size;
              const pct = Math.round((done / plan.total_days) * 100);
              return (
                <button
                  key={plan.id}
                  onClick={() => openPlan(plan.id)}
                  className="w-full text-left rounded-2xl px-5 py-4 focus:outline-none"
                  style={{ background: C.card, border: `1px solid ${C.border}` }}
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <p style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: C.ink }}>{plan.title}</p>
                    <p className="text-xs flex-shrink-0 ml-3" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}>
                      {plan.total_days} days{done > 0 ? ` · ${pct}%` : ""}
                    </p>
                  </div>
                  <p className="text-sm" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                    {plan.blurb}
                  </p>
                  {done > 0 && (
                    <div className="rounded-full h-1.5 mt-3" style={{ background: C.goldSoft }}>
                      <div className="h-1.5 rounded-full" style={{ background: C.gold, width: `${pct}%` }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
