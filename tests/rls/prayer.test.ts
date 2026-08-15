import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminClient, cleanupUser, createTestUser, type TestUser } from "../helpers";

describe("prayer_requests + prayer_acknowledgments RLS", () => {
  let owner: TestUser, member: TestUser, otherMember: TestUser, outsider: TestUser;
  let tableId: number;

  beforeAll(async () => {
    owner = await createTestUser("prayer-owner");
    member = await createTestUser("prayer-member");
    otherMember = await createTestUser("prayer-other-member");
    outsider = await createTestUser("prayer-outsider");

    const admin = adminClient();
    const { data: table } = await admin
      .from("tables")
      .insert({ name: "Prayer RLS Table", invite_code: `prayer-${Date.now()}`, created_by: owner.id })
      .select()
      .single();
    tableId = table!.id;
    await admin.from("table_members").insert([
      { table_id: tableId, user_id: owner.id, role: "owner" },
      { table_id: tableId, user_id: member.id, role: "member" },
      { table_id: tableId, user_id: otherMember.id, role: "member" },
    ]);
  });

  afterAll(async () => {
    for (const u of [owner, member, otherMember, outsider]) await cleanupUser(u.id);
  });

  it("a member can post a prayer request for themselves; an outsider cannot", async () => {
    const asOutsider = await outsider.client
      .from("prayer_requests")
      .insert({ table_id: tableId, user_id: outsider.id, text: "outsider trying to post" });
    expect(asOutsider.error).not.toBeNull();

    const asMember = await member.client
      .from("prayer_requests")
      .insert({ table_id: tableId, user_id: member.id, text: "Please pray for my family" })
      .select()
      .single();
    expect(asMember.error).toBeNull();
    expect(asMember.data?.id).toBeDefined();
  });

  it("a member cannot post a prayer request impersonating someone else", async () => {
    const { error } = await member.client
      .from("prayer_requests")
      .insert({ table_id: tableId, user_id: owner.id, text: "impersonation attempt" });
    expect(error).not.toBeNull();
  });

  let prayerId: number;
  it("all members can see a prayer request; an outsider cannot", async () => {
    const { data } = await adminClient()
      .from("prayer_requests")
      .insert({ table_id: tableId, user_id: member.id, text: "visible prayer" })
      .select()
      .single();
    prayerId = data!.id;

    expect((await owner.client.from("prayer_requests").select().eq("id", prayerId)).data).toHaveLength(1);
    expect((await otherMember.client.from("prayer_requests").select().eq("id", prayerId)).data).toHaveLength(1);
    expect((await outsider.client.from("prayer_requests").select().eq("id", prayerId)).data).toHaveLength(0);
  });

  it("only the author can edit their prayer request — not other members, not even the table owner", async () => {
    await otherMember.client.from("prayer_requests").update({ text: "edited by other member" }).eq("id", prayerId);
    await owner.client.from("prayer_requests").update({ text: "edited by owner" }).eq("id", prayerId);
    const { data } = await adminClient().from("prayer_requests").select("text").eq("id", prayerId).single();
    expect(data?.text).toBe("visible prayer");

    await member.client.from("prayer_requests").update({ text: "edited by author" }).eq("id", prayerId);
    const after = await adminClient().from("prayer_requests").select("text").eq("id", prayerId).single();
    expect(after.data?.text).toBe("edited by author");
  });

  it("the author or the table owner can delete a prayer request — a plain member cannot", async () => {
    const { data } = await adminClient()
      .from("prayer_requests")
      .insert({ table_id: tableId, user_id: member.id, text: "to be deleted by owner" })
      .select()
      .single();

    await otherMember.client.from("prayer_requests").delete().eq("id", data!.id);
    expect((await adminClient().from("prayer_requests").select().eq("id", data!.id)).data).toHaveLength(1);

    await owner.client.from("prayer_requests").delete().eq("id", data!.id);
    expect((await adminClient().from("prayer_requests").select().eq("id", data!.id)).data).toHaveLength(0);
  });

  it("acknowledgments: any member can mark they're praying; an outsider cannot; can't impersonate", async () => {
    const asOutsider = await outsider.client
      .from("prayer_acknowledgments")
      .insert({ prayer_id: prayerId, user_id: outsider.id });
    expect(asOutsider.error).not.toBeNull();

    const impersonate = await otherMember.client
      .from("prayer_acknowledgments")
      .insert({ prayer_id: prayerId, user_id: owner.id });
    expect(impersonate.error).not.toBeNull();

    const asMember = await otherMember.client
      .from("prayer_acknowledgments")
      .insert({ prayer_id: prayerId, user_id: otherMember.id })
      .select()
      .single();
    expect(asMember.error).toBeNull();

    expect((await owner.client.from("prayer_acknowledgments").select().eq("prayer_id", prayerId)).data).toHaveLength(1);
    expect((await outsider.client.from("prayer_acknowledgments").select().eq("prayer_id", prayerId)).data).toHaveLength(0);
  });

  it("only the acknowledging user can remove their own acknowledgment — not even the table owner", async () => {
    const { data: ack } = await adminClient()
      .from("prayer_acknowledgments")
      .select()
      .eq("prayer_id", prayerId)
      .eq("user_id", otherMember.id)
      .single();

    await owner.client.from("prayer_acknowledgments").delete().eq("prayer_id", prayerId).eq("user_id", ack!.user_id);
    expect(
      (await adminClient().from("prayer_acknowledgments").select().eq("prayer_id", prayerId).eq("user_id", ack!.user_id)).data
    ).toHaveLength(1);

    await otherMember.client.from("prayer_acknowledgments").delete().eq("prayer_id", prayerId).eq("user_id", ack!.user_id);
    expect(
      (await adminClient().from("prayer_acknowledgments").select().eq("prayer_id", prayerId).eq("user_id", ack!.user_id)).data
    ).toHaveLength(0);
  });
});
