import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return NextResponse.json(
      { error: "Save your account first, so you don’t lose your seat at this table if you switch devices." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toLowerCase() : "";
  if (!code) {
    return NextResponse.json({ error: "Enter an invite code." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: table } = await admin.from("tables").select("id, name").eq("invite_code", code).maybeSingle();
  if (!table) {
    return NextResponse.json({ error: "That invite code doesn’t match a table." }, { status: 404 });
  }

  const { error } = await admin
    .from("table_members")
    .upsert({ table_id: table.id, user_id: user.id, role: "member" }, { onConflict: "table_id,user_id", ignoreDuplicates: true });
  if (error) {
    console.error("table join error", error);
    return NextResponse.json({ error: "Couldn’t join that table just now." }, { status: 500 });
  }

  return NextResponse.json({ table });
}
