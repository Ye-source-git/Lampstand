"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { C } from "@/lib/constants";
import { QuietButton } from "@/components/ui";
import { RequireSavedAccount } from "@/components/auth/RequireSavedAccount";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

type Table = { id: number; name: string; invite_code: string };
type Member = { user_id: string; role: string; email: string; joined_at: string };

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
