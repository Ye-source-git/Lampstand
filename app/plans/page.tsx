"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { C, PLANS } from "@/lib/constants";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

export default function PlansPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<Record<string, Set<number>>>({});
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      if (!user) {
        setProgress({});
        setLoaded(true);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("plan_progress")
        .select("plan_id, day_index")
        .eq("user_id", user.id);
      const next: Record<string, Set<number>> = {};
      for (const row of data ?? []) {
        if (!next[row.plan_id]) next[row.plan_id] = new Set();
        next[row.plan_id].add(row.day_index);
      }
      setProgress(next);
      setLoaded(true);
    })();
  }, [user, authLoading]);

  function openReading(book: string, chapter: number) {
    router.push(`/read?book=${encodeURIComponent(book)}&chapter=${chapter}`);
  }

  async function toggleDay(planId: string, dayIndex: number) {
    if (!user) return;
    const supabase = createClient();
    const done = new Set(progress[planId] || []);
    if (done.has(dayIndex)) {
      done.delete(dayIndex);
      await supabase
        .from("plan_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("plan_id", planId)
        .eq("day_index", dayIndex);
    } else {
      done.add(dayIndex);
      await supabase.from("plan_progress").insert({ user_id: user.id, plan_id: planId, day_index: dayIndex });
    }
    setProgress({ ...progress, [planId]: done });
  }

  if (!loaded) return null;

  if (openPlanId) {
    const plan = PLANS.find((p) => p.id === openPlanId)!;
    const done = progress[plan.id] || new Set<number>();
    const pct = Math.round((done.size / plan.days.length) * 100);
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
            to track your progress through this plan.
          </p>
        )}

        <div className="rounded-full h-2 mb-2" style={{ background: C.goldSoft }}>
          <div className="h-2 rounded-full transition-all" style={{ background: C.gold, width: `${pct}%` }} />
        </div>
        <p className="text-xs mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
          {done.size} of {plan.days.length} days · {pct}%
        </p>

        <div className="space-y-2">
          {plan.days.map(([label, book, chapter], i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: C.card, border: `1px solid ${C.border}`, opacity: done.has(i) ? 0.65 : 1 }}
            >
              <button
                onClick={() => toggleDay(plan.id, i)}
                disabled={!user}
                aria-label={done.has(i) ? "Mark day incomplete" : "Mark day complete"}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs focus:outline-none flex-shrink-0"
                style={{
                  border: `2px solid ${done.has(i) ? C.gold : C.border}`,
                  background: done.has(i) ? C.gold : "transparent",
                  color: C.white,
                  fontFamily: "'Albert Sans', sans-serif",
                }}
              >
                {done.has(i) ? "✓" : ""}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[15px]"
                  style={{ fontFamily: "'Lora', serif", color: C.ink, textDecoration: done.has(i) ? "line-through" : "none" }}
                >
                  Day {i + 1} · {label}
                </p>
                <p className="text-xs" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                  {book} {chapter}
                </p>
              </div>
              <button
                onClick={() => openReading(book, chapter)}
                className="text-xs font-semibold focus:outline-none flex-shrink-0"
                style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
              >
                Read →
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
        A little each day goes a long way.
      </h2>
      <p className="text-sm mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        Pick a plan, read one short passage a day, and your progress is saved as you go.
      </p>
      <div className="space-y-3">
        {PLANS.map((plan) => {
          const done = (progress[plan.id] || new Set()).size;
          const pct = Math.round((done / plan.days.length) * 100);
          return (
            <button
              key={plan.id}
              onClick={() => setOpenPlanId(plan.id)}
              className="w-full text-left rounded-2xl px-5 py-4 focus:outline-none"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-baseline justify-between mb-1">
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: C.ink }}>{plan.title}</p>
                <p className="text-xs flex-shrink-0 ml-3" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}>
                  {plan.days.length} days{done > 0 ? ` · ${pct}%` : ""}
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
  );
}
