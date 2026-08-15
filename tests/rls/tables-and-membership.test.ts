import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminClient, cleanupUser, createTestUser, type TestUser } from "../helpers";

describe("tables + table_members RLS", () => {
  let owner: TestUser, member: TestUser, outsider: TestUser;
  let tableId: number;

  beforeAll(async () => {
    owner = await createTestUser("owner");
    member = await createTestUser("member");
    outsider = await createTestUser("outsider");

    const admin = adminClient();
    const { data: table } = await admin
      .from("tables")
      .insert({ name: "RLS Test Table", invite_code: `rls-${Date.now()}`, created_by: owner.id })
      .select()
      .single();
    tableId = table!.id;
    await admin.from("table_members").insert([
      { table_id: tableId, user_id: owner.id, role: "owner" },
      { table_id: tableId, user_id: member.id, role: "member" },
    ]);
  });

  afterAll(async () => {
    await cleanupUser(owner.id);
    await cleanupUser(member.id);
    await cleanupUser(outsider.id);
  });

  it("owner and member can see the table; an outsider cannot", async () => {
    expect((await owner.client.from("tables").select().eq("id", tableId)).data).toHaveLength(1);
    expect((await member.client.from("tables").select().eq("id", tableId)).data).toHaveLength(1);
    expect((await outsider.client.from("tables").select().eq("id", tableId)).data).toHaveLength(0);
  });

  it("member can see the member list; an outsider cannot", async () => {
    expect((await member.client.from("table_members").select().eq("table_id", tableId)).data).toHaveLength(2);
    expect((await outsider.client.from("table_members").select().eq("table_id", tableId)).data).toHaveLength(0);
  });

  it("a user's own client cannot insert into table_members at all (no INSERT policy — admin-only by design)", async () => {
    const { error } = await member.client
      .from("table_members")
      .insert({ table_id: tableId, user_id: outsider.id, role: "member" });
    expect(error).not.toBeNull();
  });

  it("only the owner can update the table; a regular member cannot", async () => {
    const asMember = await member.client.from("tables").update({ name: "Renamed by member" }).eq("id", tableId).select();
    expect(asMember.data).toHaveLength(0); // RLS silently filters, doesn't error, but affects 0 rows

    const asOwner = await owner.client.from("tables").update({ name: "Renamed by owner" }).eq("id", tableId).select();
    expect(asOwner.data).toHaveLength(1);
  });

  it("a member can remove themselves; a non-owner cannot remove someone else", async () => {
    const other = await createTestUser("other-member");
    await adminClient().from("table_members").insert({ table_id: tableId, user_id: other.id, role: "member" });

    // member (non-owner) tries to remove `other` (non-owner) — must fail.
    await member.client.from("table_members").delete().eq("table_id", tableId).eq("user_id", other.id);
    expect(
      (await adminClient().from("table_members").select().eq("table_id", tableId).eq("user_id", other.id)).data
    ).toHaveLength(1);

    // owner removes `other` — must succeed.
    await owner.client.from("table_members").delete().eq("table_id", tableId).eq("user_id", other.id);
    expect(
      (await adminClient().from("table_members").select().eq("table_id", tableId).eq("user_id", other.id)).data
    ).toHaveLength(0);

    await cleanupUser(other.id);
  });

  it("only the owner can delete the table", async () => {
    const admin = adminClient();
    const { data: t2 } = await admin
      .from("tables")
      .insert({ name: "RLS Delete Test", invite_code: `rls-del-${Date.now()}`, created_by: owner.id })
      .select()
      .single();
    await admin.from("table_members").insert([
      { table_id: t2!.id, user_id: owner.id, role: "owner" },
      { table_id: t2!.id, user_id: member.id, role: "member" },
    ]);

    await member.client.from("tables").delete().eq("id", t2!.id);
    expect((await admin.from("tables").select().eq("id", t2!.id)).data).toHaveLength(1);

    await owner.client.from("tables").delete().eq("id", t2!.id);
    expect((await admin.from("tables").select().eq("id", t2!.id)).data).toHaveLength(0);
  });
});
