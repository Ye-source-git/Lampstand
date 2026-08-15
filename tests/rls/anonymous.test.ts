import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminClient, anonClient, cleanupUser, createTestUser, type TestUser } from "../helpers";

// A pure anon-key client with no session at all (auth.uid() is null) — the
// baseline every unauthenticated request to the public API starts from.
describe("anonymous (no session) access", () => {
  let owner: TestUser;
  let tableId: number;

  beforeAll(async () => {
    owner = await createTestUser("anon-owner");
    const admin = adminClient();
    const { data: table } = await admin
      .from("tables")
      .insert({ name: "Anon RLS Table", invite_code: `anon-${Date.now()}`, created_by: owner.id })
      .select()
      .single();
    tableId = table!.id;
    await admin.from("table_members").insert({ table_id: tableId, user_id: owner.id, role: "owner" });
    await admin.from("marks").insert({ user_id: owner.id, book: "Genesis", chapter: 1, verse: 1, color: "gold" });
    await admin.from("prayer_requests").insert({ table_id: tableId, user_id: owner.id, text: "private to the table" });
  });

  afterAll(async () => {
    await cleanupUser(owner.id);
  });

  it("cannot see anyone's private or table-scoped data", async () => {
    // A raw anon-key request (no session at all) has zero table-level GRANTs
    // on these tables — checked before RLS even runs — so it's a hard
    // permission-denied, not an RLS-filtered empty result. (A real visitor
    // never hits this path: AuthProvider signs them in anonymously first,
    // which is the scenario the other RLS suites cover.)
    const client = anonClient();
    expect((await client.from("marks").select().eq("user_id", owner.id)).error?.code).toBe("42501");
    expect((await client.from("tables").select().eq("id", tableId)).error?.code).toBe("42501");
    expect((await client.from("table_members").select().eq("table_id", tableId)).error?.code).toBe("42501");
    expect((await client.from("prayer_requests").select().eq("table_id", tableId)).error?.code).toBe("42501");
  });

  it("cannot write to owner-scoped or table-scoped tables", async () => {
    const client = anonClient();
    expect(
      (await client.from("marks").insert({ user_id: owner.id, book: "Exodus", chapter: 1, verse: 1 })).error
    ).not.toBeNull();
    expect(
      (await client.from("prayer_requests").insert({ table_id: tableId, user_id: owner.id, text: "no session" })).error
    ).not.toBeNull();
  });

  it("can still read genuinely public reference content", async () => {
    const client = anonClient();
    expect((await client.from("verses").select().eq("book", "John").eq("chapter", 3).eq("verse", 16)).data?.length).toBeGreaterThan(0);
    expect((await client.from("plans").select().limit(1)).data?.length).toBeGreaterThan(0);
    expect((await client.from("glossary").select().limit(1)).data?.length).toBeGreaterThan(0);
  });
});
