import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function randomCode() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return NextResponse.json(
      { error: "Save your account first, so you don’t lose your table if you switch devices." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";
  if (!name) {
    return NextResponse.json({ error: "Give your table a name." }, { status: 400 });
  }

  const admin = createAdminClient();

  let table = null;
  for (let attempt = 0; attempt < 5 && !table; attempt++) {
    const { data, error } = await admin
      .from("tables")
      .insert({ name, invite_code: randomCode(), created_by: user.id })
      .select()
      .single();
    if (!error) {
      table = data;
    } else if (error.code !== "23505") {
      // Anything other than a unique-constraint collision on invite_code is unexpected.
      console.error("tables create error", error);
      return NextResponse.json({ error: "Couldn’t create the table just now." }, { status: 500 });
    }
  }
  if (!table) {
    return NextResponse.json({ error: "Couldn’t create the table just now." }, { status: 500 });
  }

  const { error: memberError } = await admin
    .from("table_members")
    .insert({ table_id: table.id, user_id: user.id, role: "owner" });
  if (memberError) {
    console.error("table_members insert error", memberError);
    await admin.from("tables").delete().eq("id", table.id);
    return NextResponse.json({ error: "Couldn’t create the table just now." }, { status: 500 });
  }

  return NextResponse.json({ table });
}
