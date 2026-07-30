"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { C, PLANS, todaysVerse } from "@/lib/constants";
import { GoldButton } from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

type Resume = { plan: (typeof PLANS)[number]; nextIdx: number; done: number };

export default function TodayPage() {
  const verse = todaysVerse();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [resume, setResume] = useState<Resume[]>([]);
  const [resumeLoading, setResumeLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      if (!user) {
        setResume([]);
        setResumeLoading(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("plan_progress")
        .select("plan_id, day_index")
        .eq("user_id", user.id);

      const byPlan = new Map<string, Set<number>>();
      for (const row of data ?? []) {
        if (!byPlan.has(row.plan_id)) byPlan.set(row.plan_id, new Set());
        byPlan.get(row.plan_id)!.add(row.day_index);
      }

      const items: Resume[] = [];
      for (const plan of PLANS) {
        const done = byPlan.get(plan.id) ?? new Set<number>();
        if (done.size > 0 && done.size < plan.days.length) {
          const nextIdx = plan.days.findIndex((_, i) => !done.has(i));
          if (nextIdx !== -1) items.push({ plan, nextIdx, done: done.size });
        }
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

      <div className="rounded-3xl px-6 py-8 sm:px-10 sm:py-10 mb-8" style={{ background: C.deep }}>
        <p
          className="text-xs mb-4"
          style={{ color: C.goldSoft, fontFamily: "'Albert Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          Verse for today
        </p>
        <p className="leading-relaxed mb-5" style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: C.white }}>
          “{verse.text}”
        </p>
        <p className="text-sm mb-6" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.goldSoft }}>
          {verse.ref} · World English Bible
        </p>
        <div className="flex flex-wrap gap-2">
          <GoldButton onClick={() => openReading(verse.book, verse.chapter)}>Read the chapter</GoldButton>
          <button
            onClick={() =>
              askAbout(`${verse.ref} — “${verse.text}” — can you help me understand this verse and its context?`)
            }
            className="px-4 py-2 rounded-full text-sm font-semibold focus:outline-none"
            style={{ fontFamily: "'Albert Sans', sans-serif", background: "transparent", border: `1px solid ${C.goldSoft}`, color: C.goldSoft }}
          >
            Ask about this verse
          </button>
        </div>
      </div>

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
            {resume.map(({ plan, nextIdx }) => (
              <div key={plan.id} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px]" style={{ fontFamily: "'Lora', serif", color: C.ink }}>{plan.title}</p>
                  <p className="text-xs" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                    Day {nextIdx + 1} of {plan.days.length} · {plan.days[nextIdx][0]} ({plan.days[nextIdx][1]} {plan.days[nextIdx][2]})
                  </p>
                </div>
                <button
                  onClick={() => openReading(plan.days[nextIdx][1] as string, plan.days[nextIdx][2] as number)}
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
