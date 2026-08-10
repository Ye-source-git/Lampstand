"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { C } from "@/lib/constants";
import { QuietButton } from "@/components/ui";
import { RequireSavedAccount } from "@/components/auth/RequireSavedAccount";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

type Table = { id: number; name: string; invite_code: string };
type Member = { user_id: string; role: string; email: string; joined_at: string };
type ActivePlan = { planId: string; title: string; totalDays: number };
type MemberProgress = { userId: string; done: number; readToday: boolean };
type PlanOption = { id: string; title: string };
type Prayer = {
  id: number;
  userId: string;
  text: string;
  createdAt: string;
  answeredAt: string | null;
  ackCount: number;
  ackedByMe: boolean;
};

export default function TableDetailPage() {
  const params = useParams();
  const id = params.id as string;
  return (
    <RequireSavedAccount next={`/tables/${id}`}>
      <TableDetail id={id} />
    </RequireSavedAccount>
  );
}

function TableDetail({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [table, setTable] = useState<Table | null>(null);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [yourRole, setYourRole] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [progress, setProgress] = useState<MemberProgress[] | null>(null);
  const [streak, setStreak] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<PlanOption[] | null>(null);

  const [prayers, setPrayers] = useState<Prayer[] | null>(null);
  const [newPrayerText, setNewPrayerText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("tables").select("id, name, invite_code").eq("id", id).maybeSingle();
      if (!data) {
        setNotFound(true);
        return;
      }
      setTable(data);

      const res = await fetch(`/api/tables/${id}/members`);
      if (res.ok) {
        const json = await res.json();
        setMembers(json.members);
        setYourRole(json.yourRole);
      }
    })();
  }, [id, user]);

  const refreshPlan = useCallback(async () => {
    if (!members) return;
    const supabase = createClient();
    const { data: tp } = await supabase
      .from("table_plans")
      .select("plan_id, started_at, plans(title, total_days)")
      .eq("table_id", id)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!tp) {
      setActivePlan(null);
      setProgress(null);
      setStreak(0);
      return;
    }

    const planInfo = Array.isArray(tp.plans) ? tp.plans[0] : tp.plans;
    const planId = tp.plan_id as string;
    setActivePlan({ planId, title: planInfo?.title ?? planId, totalDays: planInfo?.total_days ?? 0 });

    const { data: rows } = await supabase.from("plan_progress").select("user_id, completed_at").eq("plan_id", planId);

    const todayStr = new Date().toISOString().slice(0, 10);
    const byUser = new Map<string, { done: number; readToday: boolean }>();
    const allDates = new Set<string>();
    for (const r of rows ?? []) {
      const dateStr = new Date(r.completed_at as string).toISOString().slice(0, 10);
      allDates.add(dateStr);
      const cur = byUser.get(r.user_id) ?? { done: 0, readToday: false };
      cur.done += 1;
      if (dateStr === todayStr) cur.readToday = true;
      byUser.set(r.user_id, cur);
    }
    setProgress(members.map((m) => ({ userId: m.user_id, ...(byUser.get(m.user_id) ?? { done: 0, readToday: false }) })));

    // Collective streak: consecutive calendar days (ending today or yesterday)
    // where at least one member at the table completed a reading. As long as
    // someone shows up, the streak holds — it's not tied to any one person.
    let count = 0;
    const cursor = new Date();
    if (!allDates.has(todayStr)) cursor.setDate(cursor.getDate() - 1);
    while (allDates.has(cursor.toISOString().slice(0, 10))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    setStreak(count);
  }, [id, members]);

  useEffect(() => {
    refreshPlan();
  }, [refreshPlan]);

  const loadPrayers = useCallback(async () => {
    const supabase = createClient();
    const { data: requests } = await supabase
      .from("prayer_requests")
      .select("id, user_id, text, created_at, answered_at")
      .eq("table_id", id)
      .order("created_at", { ascending: false });

    if (!requests || requests.length === 0) {
      setPrayers([]);
      return;
    }

    const { data: acks } = await supabase
      .from("prayer_acknowledgments")
      .select("prayer_id, user_id")
      .in(
        "prayer_id",
        requests.map((r) => r.id)
      );

    setPrayers(
      requests.map((r) => {
        const theseAcks = (acks ?? []).filter((a) => a.prayer_id === r.id);
        return {
          id: r.id,
          userId: r.user_id,
          text: r.text,
          createdAt: r.created_at,
          answeredAt: r.answered_at,
          ackCount: theseAcks.length,
          ackedByMe: theseAcks.some((a) => a.user_id === user?.id),
        };
      })
    );
  }, [id, user]);

  useEffect(() => {
    loadPrayers();
  }, [loadPrayers]);

  async function postPrayer() {
    if (!newPrayerText.trim() || !user || posting) return;
    setPosting(true);
    const supabase = createClient();
    await supabase.from("prayer_requests").insert({ table_id: Number(id), user_id: user.id, text: newPrayerText.trim().slice(0, 500) });
    setNewPrayerText("");
    setPosting(false);
    await loadPrayers();
  }

  async function toggleAck(prayerId: number, alreadyActed: boolean) {
    if (!user) return;
    const supabase = createClient();
    if (alreadyActed) {
      await supabase.from("prayer_acknowledgments").delete().eq("prayer_id", prayerId).eq("user_id", user.id);
    } else {
      await supabase.from("prayer_acknowledgments").insert({ prayer_id: prayerId, user_id: user.id });
    }
    await loadPrayers();
  }

  async function toggleAnswered(prayerId: number, currentlyAnswered: boolean) {
    const supabase = createClient();
    await supabase
      .from("prayer_requests")
      .update({ answered_at: currentlyAnswered ? null : new Date().toISOString() })
      .eq("id", prayerId);
    await loadPrayers();
  }

  async function removePrayer(prayerId: number) {
    const supabase = createClient();
    await supabase.from("prayer_requests").delete().eq("id", prayerId);
    await loadPrayers();
  }

  async function openPicker() {
    setPickerOpen(true);
    if (!availablePlans) {
      const supabase = createClient();
      const { data } = await supabase.from("plans").select("id, title").order("sort_order");
      setAvailablePlans(data ?? []);
    }
  }

  async function startPlan(planId: string) {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("table_plans").insert({ table_id: Number(id), plan_id: planId, started_by: user.id });
    setPickerOpen(false);
    await refreshPlan();
  }

  async function stopPlan() {
    if (!activePlan) return;
    const supabase = createClient();
    await supabase.from("table_plans").delete().eq("table_id", id).eq("plan_id", activePlan.planId);
    setActivePlan(null);
    setProgress(null);
    setStreak(0);
  }

  async function removeMember(targetUserId: string) {
    const supabase = createClient();
    await supabase.from("table_members").delete().eq("table_id", id).eq("user_id", targetUserId);
    setMembers((m) => m?.filter((x) => x.user_id !== targetUserId) ?? null);
  }

  async function leaveTable() {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("table_members").delete().eq("table_id", id).eq("user_id", user.id);
    router.push("/tables");
  }

  function copyInvite() {
    if (!table) return;
    navigator.clipboard.writeText(`${window.location.origin}/tables/join/${table.invite_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (notFound) {
    return (
      <div className="rounded-2xl px-5 py-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <p className="text-[15px]" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
          Either this table doesn’t exist, or you’re not at it.
        </p>
      </div>
    );
  }

  if (!table) {
    return (
      <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
        Loading…
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push("/tables")}
        className="text-sm mb-4 focus:outline-none"
        style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
      >
        ← Your tables
      </button>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-4">
        {table.name}
      </h2>

      <div className="rounded-2xl px-5 py-4 mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <p className="text-xs font-semibold mb-2" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
          Invite someone to this table
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <code
            className="text-sm px-3 py-1.5 rounded-lg"
            style={{ background: C.paper, border: `1px solid ${C.border}`, color: C.ink, fontFamily: "monospace" }}
          >
            {table.invite_code}
          </code>
          <QuietButton onClick={copyInvite}>{copied ? "Copied ✓" : "Copy invite link"}</QuietButton>
        </div>
      </div>

      <div className="rounded-2xl px-5 py-4 mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <p className="text-xs font-semibold mb-3" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
          Reading together
        </p>

        {activePlan ? (
          <>
            <div className="flex items-baseline justify-between mb-1 gap-3">
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: C.ink }}>{activePlan.title}</p>
              <QuietButton onClick={() => router.push("/plans")}>Open plan</QuietButton>
            </div>
            {streak > 0 && (
              <p className="text-sm mb-3 italic" style={{ fontFamily: "'Lora', serif", color: C.gold }}>
                {streak === 1
                  ? "Your table read together today."
                  : `Your table has kept this going for ${streak} days.`}
              </p>
            )}
            <div className="space-y-2 mt-2">
              {progress?.map((p) => {
                const m = members?.find((mm) => mm.user_id === p.userId);
                return (
                  <div key={p.userId} className="flex items-center justify-between">
                    <p className="text-sm" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.ink }}>
                      {m?.email}
                      {p.userId === user?.id && " (you)"}
                    </p>
                    <p
                      className="text-xs"
                      style={{ fontFamily: "'Albert Sans', sans-serif", color: p.readToday ? C.gold : C.inkSoft }}
                    >
                      {p.done} of {activePlan.totalDays}
                      {p.readToday ? " · read today" : ""}
                    </p>
                  </div>
                );
              })}
            </div>
            {yourRole === "owner" && (
              <button
                onClick={stopPlan}
                className="text-xs mt-3 focus:outline-none"
                style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
              >
                Change plan
              </button>
            )}
          </>
        ) : yourRole === "owner" ? (
          pickerOpen ? (
            <div className="space-y-1">
              {availablePlans === null ? (
                <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
                  Loading…
                </p>
              ) : (
                availablePlans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => startPlan(p.id)}
                    className="block w-full text-left text-sm px-2 py-1.5 rounded-lg focus:outline-none"
                    style={{ fontFamily: "'Lora', serif", color: C.ink }}
                  >
                    {p.title}
                  </button>
                ))
              )}
            </div>
          ) : (
            <QuietButton onClick={openPicker}>Start reading together</QuietButton>
          )
        ) : (
          <p className="text-sm" style={{ fontFamily: "'Lora', serif", color: C.inkSoft }}>
            Nobody’s started a shared plan here yet.
          </p>
        )}
      </div>

      <div className="rounded-2xl px-5 py-4 mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <p className="text-xs font-semibold mb-3" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
          Prayer wall
        </p>

        <div className="mb-4">
          <textarea
            value={newPrayerText}
            onChange={(e) => setNewPrayerText(e.target.value)}
            placeholder="Share something you’d like this table to pray for…"
            rows={2}
            className="w-full rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none leading-relaxed"
            style={{ fontFamily: "'Lora', serif", background: C.paper, border: `1px solid ${C.border}`, color: C.ink }}
          />
          <QuietButton onClick={postPrayer}>{posting ? "Sharing…" : "Share a request"}</QuietButton>
        </div>

        {prayers === null ? (
          <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
            Loading…
          </p>
        ) : prayers.length === 0 ? (
          <p className="text-sm" style={{ fontFamily: "'Lora', serif", color: C.inkSoft }}>
            Nothing shared here yet.
          </p>
        ) : (
          <div className="space-y-3">
            {prayers.map((p) => {
              const m = members?.find((mm) => mm.user_id === p.userId);
              return (
                <div
                  key={p.id}
                  className="rounded-xl px-4 py-3"
                  style={{ background: C.paper, border: `1px solid ${C.border}`, opacity: p.answeredAt ? 0.7 : 1 }}
                >
                  <p className="text-xs mb-1" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
                    {m?.email}
                    {p.userId === user?.id && " (you)"}
                    {p.answeredAt && " · answered"}
                  </p>
                  <p className="text-sm leading-relaxed mb-2" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
                    {p.text}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => toggleAck(p.id, p.ackedByMe)}
                      className="text-xs font-semibold focus:outline-none"
                      style={{ fontFamily: "'Albert Sans', sans-serif", color: p.ackedByMe ? C.gold : C.inkSoft }}
                    >
                      {p.ackedByMe ? "Praying ✓" : "Praying for this"}
                      {p.ackCount > 0 ? ` (${p.ackCount})` : ""}
                    </button>
                    {p.userId === user?.id && (
                      <button
                        onClick={() => toggleAnswered(p.id, Boolean(p.answeredAt))}
                        className="text-xs focus:outline-none"
                        style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
                      >
                        {p.answeredAt ? "Mark unanswered" : "Mark answered"}
                      </button>
                    )}
                    {(p.userId === user?.id || yourRole === "owner") && (
                      <button
                        onClick={() => removePrayer(p.id)}
                        className="text-xs focus:outline-none"
                        style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs font-semibold mb-3" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
        Who’s here
      </p>
      {members === null ? (
        <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
          Loading…
        </p>
      ) : (
        <div className="space-y-2 mb-6">
          {members.map((m) => (
            <div
              key={m.user_id}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div>
                <p className="text-sm" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
                  {m.email}
                  {m.user_id === user?.id && " (you)"}
                </p>
                {m.role === "owner" && (
                  <p className="text-xs" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}>
                    Started this table
                  </p>
                )}
              </div>
              {yourRole === "owner" && m.user_id !== user?.id && (
                <button
                  onClick={() => removeMember(m.user_id)}
                  className="text-xs focus:outline-none"
                  style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {yourRole !== "owner" && (
        <button
          onClick={leaveTable}
          className="text-xs focus:outline-none"
          style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
        >
          Leave this table
        </button>
      )}
    </div>
  );
}
