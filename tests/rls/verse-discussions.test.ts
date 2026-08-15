import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminClient, cleanupUser, createTestUser, type TestUser } from "../helpers";

describe("verse_discussions + verse_discussion_locks RLS", () => {
  let owner: TestUser, member: TestUser, outsider: TestUser;
  let tableId: number;
  const loc = { book: "John", chapter: 3, verse: 16 };
  const otherLoc = { book: "John", chapter: 3, verse: 17 };

  beforeAll(async () => {
    owner = await createTestUser("vd-owner");
    member = await createTestUser("vd-member");
    outsider = await createTestUser("vd-outsider");

    const admin = adminClient();
    const { data: table } = await admin
      .from("tables")
      .insert({ name: "VD RLS Table", invite_code: `vd-${Date.now()}`, created_by: owner.id })
      .select()
      .single();
    tableId = table!.id;
    await admin.from("table_members").insert([
      { table_id: tableId, user_id: owner.id, role: "owner" },
      { table_id: tableId, user_id: member.id, role: "member" },
    ]);
  });

  afterAll(async () => {
    for (const u of [owner, member, outsider]) await cleanupUser(u.id);
  });

  it("a member can post a comment; an outsider cannot; can't impersonate", async () => {
    const asOutsider = await outsider.client
      .from("verse_discussions")
      .insert({ table_id: tableId, ...loc, user_id: outsider.id, text: "outsider" });
    expect(asOutsider.error).not.toBeNull();

    const impersonate = await member.client
      .from("verse_discussions")
      .insert({ table_id: tableId, ...loc, user_id: owner.id, text: "impersonation" });
    expect(impersonate.error).not.toBeNull();

    const asMember = await member.client
      .from("verse_discussions")
      .insert({ table_id: tableId, ...loc, user_id: member.id, text: "For God so loved..." })
      .select()
      .single();
    expect(asMember.error).toBeNull();
  });

  it("all members can see comments at that verse; an outsider cannot", async () => {
    expect((await owner.client.from("verse_discussions").select().eq("table_id", tableId)).data).toHaveLength(1);
    expect((await outsider.client.from("verse_discussions").select().eq("table_id", tableId)).data).toHaveLength(0);
  });

  it("only the table owner can lock a verse discussion", async () => {
    const asMember = await member.client
      .from("verse_discussion_locks")
      .insert({ table_id: tableId, ...loc, locked_by: member.id });
    expect(asMember.error).not.toBeNull();

    const asOwner = await owner.client
      .from("verse_discussion_locks")
      .insert({ table_id: tableId, ...loc, locked_by: owner.id });
    expect(asOwner.error).toBeNull();
  });

  it("once locked, members can't post new comments there — but can still post elsewhere", async () => {
    const lockedAttempt = await member.client
      .from("verse_discussions")
      .insert({ table_id: tableId, ...loc, user_id: member.id, text: "should be blocked" });
    expect(lockedAttempt.error).not.toBeNull();

    const elsewhere = await member.client
      .from("verse_discussions")
      .insert({ table_id: tableId, ...otherLoc, user_id: member.id, text: "unlocked verse, should work" });
    expect(elsewhere.error).toBeNull();
  });

  it("only the table owner can unlock; a plain member cannot", async () => {
    await member.client.from("verse_discussion_locks").delete().eq("table_id", tableId).match(loc);
    expect(
      (await adminClient().from("verse_discussion_locks").select().eq("table_id", tableId).match(loc)).data
    ).toHaveLength(1);

    await owner.client.from("verse_discussion_locks").delete().eq("table_id", tableId).match(loc);
    expect(
      (await adminClient().from("verse_discussion_locks").select().eq("table_id", tableId).match(loc)).data
    ).toHaveLength(0);
  });

  it("author or table owner can delete a comment; a non-author non-owner member cannot", async () => {
    const other = await createTestUser("vd-other-member");
    await adminClient().from("table_members").insert({ table_id: tableId, user_id: other.id, role: "member" });
    const { data: comment } = await adminClient()
      .from("verse_discussions")
      .insert({ table_id: tableId, ...otherLoc, user_id: member.id, text: "to be moderated" })
      .select()
      .single();

    await other.client.from("verse_discussions").delete().eq("id", comment!.id);
    expect((await adminClient().from("verse_discussions").select().eq("id", comment!.id)).data).toHaveLength(1);

    await owner.client.from("verse_discussions").delete().eq("id", comment!.id);
    expect((await adminClient().from("verse_discussions").select().eq("id", comment!.id)).data).toHaveLength(0);

    await cleanupUser(other.id);
  });
});
