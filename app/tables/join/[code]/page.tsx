"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { C } from "@/lib/constants";
import { RequireSavedAccount } from "@/components/auth/RequireSavedAccount";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function JoinTablePage() {
  const params = useParams();
  const code = params.code as string;
  return (
    <RequireSavedAccount next={`/tables/join/${code}`}>
      <AutoJoin code={code} />
    </RequireSavedAccount>
  );
}

function AutoJoin({ code }: { code: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const res = await fetch("/api/tables/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn’t join that table.");
        return;
      }
      router.replace(`/tables/${data.table.id}`);
    })();
  }, [user, code, router]);

  if (error) {
    return (
      <div className="rounded-2xl px-5 py-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <p className="text-[15px]" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
      Pulling up a chair…
    </p>
  );
}
