"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/lib/constants";
import { GoldButton, QuietButton } from "@/components/ui";
import { RequireSavedAccount } from "@/components/auth/RequireSavedAccount";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

type TableRow = { role: string; tables: { id: number; name: string } | { id: number; name: string }[] | null };
type Table = { id: number; name: string; role: string };

export default function TablesPage() {
  return (
    <RequireSavedAccount next="/tables">
      <TablesList />
    </RequireSavedAccount>
  );
}

function TablesList() {
  const { user } = useAuth();
  const router = useRouter();
  const [tables, setTables] = useState<Table[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("table_members").select("role, tables(id, name)").eq("user_id", user.id);
      const rows = (data ?? []) as TableRow[];
      setTables(
        rows
          .map((r) => {
            const t = Array.isArray(r.tables) ? r.tables[0] : r.tables;
            return t ? { id: t.id, name: t.name, role: r.role } : null;
          })
          .filter((t): t is Table => t !== null)
      );
    })();
  }, [user]);

  async function createTable() {
    if (!newName.trim() || busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/tables/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Couldn’t create the table.");
      return;
    }
    router.push(`/tables/${data.table.id}`);
  }

  async function joinTable() {
    if (!joinCode.trim() || busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/tables/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: joinCode.trim() }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Couldn’t join that table.");
      return;
    }
    router.push(`/tables/${data.table.id}`);
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
        Your tables
      </h2>
      <p className="text-sm mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        Read, pray, and reflect together with people you invite. Nothing here is public — only people at your
        table see it.
      </p>

      {tables === null && (
        <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
          Loading…
        </p>
      )}

      {tables !== null && tables.length > 0 && (
        <div className="space-y-3 mb-8">
          {tables.map((t) => (
            <button
              key={t.id}
              onClick={() => router.push(`/tables/${t.id}`)}
              className="w-full text-left rounded-2xl px-5 py-4 focus:outline-none flex items-center justify-between"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: C.ink }}>{t.name}</p>
              {t.role === "owner" && (
                <span className="text-xs" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}>
                  Your table
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {tables !== null && tables.length === 0 && (
        <div className="rounded-2xl px-5 py-5 mb-8" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-[15px]" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
            You’re not at any tables yet. Start one, or join one with an invite code.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl px-5 py-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-sm font-semibold mb-3" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.ink }}>
            Start a table
          </p>
          {creating ? (
            <>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createTable()}
                placeholder="e.g. The Smith Family"
                className="w-full rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none"
                style={{ fontFamily: "'Albert Sans', sans-serif", background: C.paper, border: `1px solid ${C.border}`, color: C.ink }}
              />
              <GoldButton onClick={createTable} disabled={busy || !newName.trim()}>
                {busy ? "Creating…" : "Create"}
              </GoldButton>
            </>
          ) : (
            <QuietButton onClick={() => setCreating(true)}>+ New table</QuietButton>
          )}
        </div>

        <div className="rounded-2xl px-5 py-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-sm font-semibold mb-3" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.ink }}>
            Join a table
          </p>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinTable()}
            placeholder="Invite code"
            className="w-full rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none"
            style={{ fontFamily: "'Albert Sans', sans-serif", background: C.paper, border: `1px solid ${C.border}`, color: C.ink }}
          />
          <GoldButton onClick={joinTable} disabled={busy || !joinCode.trim()}>
            {busy ? "Joining…" : "Join"}
          </GoldButton>
        </div>
      </div>

      {error && (
        <p className="text-sm mt-4" style={{ color: "#8A3B2E", fontFamily: "'Albert Sans', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}
