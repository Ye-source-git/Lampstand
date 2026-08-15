import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminClient, cleanupUser, createTestUser, type TestUser } from "../helpers";

describe("journal_entries sharing RLS", () => {
  let author: TestUser, tableMember: TestUser, outsider: TestUser, unrelatedTableMember: TestUser;
  let tableId: number;

  beforeAll(async () => {
    author = await createTestUser("journal-author");
    tableMember = await createTestUser("journal-table-member");
    outsider = await createTestUser("journal-outsider");
    unrelatedTableMember = await createTestUser("journal-unrelated-member");

    const admin = adminClient();
    const { data: table } = await admin
      .from("tables")
      .insert({ name: "Journal RLS Table", invite_code: `journal-${Date.now()}`, created_by: author.id })
      .select()
      .single();
    tableId = table!.id;
    await admin.from("table_members").insert([
      { table_id: tableId, user_id: author.id, role: "owner" },
      { table_id: tableId, user_id: tableMember.id, role: "member" },
    ]);

    // A second, unrelated table — used to prove sharing is scoped to the
    // specific table, not "any table membership in general".
    const { data: otherTable } = await admin
      .from("tables")
      .insert({ name: "Unrelated Table", invite_code: `journal-2-${Date.now()}`, created_by: unrelatedTableMember.id })
      .select()
      .single();
    await admin
      .from("table_members")
      .insert({ table_id: otherTable!.id, user_id: unrelatedTableMember.id, role: "owner" });
  });

  afterAll(async () => {
    for (const u of [author, tableMember, outsider, unrelatedTableMember]) await cleanupUser(u.id);
  });

  it("a private (unshared) entry is visible only to its author", async () => {
    const { data: entry } = await author.client
      .from("journal_entries")
      .insert({ user_id: author.id, text: "just for me" })
      .select()
      .single();

    expect((await author.client.from("journal_entries").select().eq("id", entry!.id)).data).toHaveLength(1);
    expect((await tableMember.client.from("journal_entries").select().eq("id", entry!.id)).data).toHaveLength(0);
    expect((await outsider.client.from("journal_entries").select().eq("id", entry!.id)).data).toHaveLength(0);
  });

  it("once shared to a table, members of that table can see it — outsiders and unrelated-table members cannot", async () => {
    const { data: entry } = await author.client
      .from("journal_entries")
      .insert({ user_id: author.id, text: "sharing this with my table", shared_with_table_id: tableId })
      .select()
      .single();

    expect((await tableMember.client.from("journal_entries").select().eq("id", entry!.id)).data).toHaveLength(1);
    expect((await outsider.client.from("journal_entries").select().eq("id", entry!.id)).data).toHaveLength(0);
    expect(
      (await unrelatedTableMember.client.from("journal_entries").select().eq("id", entry!.id)).data
    ).toHaveLength(0);
  });

  it("sharing grants read-only access — a table member cannot edit or delete someone else's shared entry", async () => {
    const { data: entry } = await author.client
      .from("journal_entries")
      .insert({ user_id: author.id, text: "read-only to others", shared_with_table_id: tableId })
      .select()
      .single();

    await tableMember.client.from("journal_entries").update({ text: "edited by a table member" }).eq("id", entry!.id);
    const afterEdit = await adminClient().from("journal_entries").select("text").eq("id", entry!.id).single();
    expect(afterEdit.data?.text).toBe("read-only to others");

    await tableMember.client.from("journal_entries").delete().eq("id", entry!.id);
    expect((await adminClient().from("journal_entries").select().eq("id", entry!.id)).data).toHaveLength(1);
  });

  it("a user cannot write a journal entry under someone else's user_id", async () => {
    const { error } = await tableMember.client
      .from("journal_entries")
      .insert({ user_id: author.id, text: "impersonation attempt" });
    expect(error).not.toBeNull();
  });
});
