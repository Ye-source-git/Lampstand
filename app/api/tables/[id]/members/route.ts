import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tableId = Number(id);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const admin = createAdminClient();

  // Confirm the caller is actually a member before revealing anyone's email —
  // RLS already guards this for the members list itself, but this route uses
  // the service role (to look up emails), so it has to check membership itself.
  const { data: membership } = await admin
    .from("table_members")
    .select("role")
    .eq("table_id", tableId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: "Not a member of this table." }, { status: 403 });

  const { data: members } = await admin
    .from("table_members")
    .select("user_id, role, joined_at")
    .eq("table_id", tableId)
    .order("joined_at", { ascending: true });

  const withEmails = await Promise.all(
    (members ?? []).map(async (m) => {
      const { data } = await admin.auth.admin.getUserById(m.user_id);
      return { ...m, email: data.user?.email ?? "Member" };
    })
  );

  return NextResponse.json({ members: withEmails, yourRole: membership.role });
}
