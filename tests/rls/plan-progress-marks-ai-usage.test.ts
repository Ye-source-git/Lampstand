import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminClient, cleanupUser, createTestUser, type TestUser } from "../helpers";

describe("plan_progress / marks / ai_usage RLS", () => {
  let userA: TestUser, userB: TestUser, stranger: TestUser;
  let sharedTableId: number;
  const sharedPlanId = "jesus";
  const unsharedPlanId = "psalms";

  beforeAll(async () => {
    userA = await createTestUser("progress-a");
    userB = await createTestUser("progress-b");
    stranger = await createTestUser("progress-stranger");

    const admin = adminClient();
    const { data: table } = await admin
      .from("tables")
      .insert({ name: "Progress RLS Table", invite_code: `progress-${Date.now()}`, created_by: userA.id })
      .select()
      .single();
    sharedTableId = table!.id;
    await admin.from("table_members").insert([
      { table_id: sharedTableId, user_id: userA.id, role: "owner" },
      { table_id: sharedTableId, user_id: userB.id, role: "member" },
    ]);
    await admin.from("table_plans").insert({ table_id: sharedTableId, plan_id: sharedPlanId, started_by: userA.id });
  });

  afterAll(async () => {
    for (const u of [userA, userB, stranger]) await cleanupUser(u.id);
  });

  it("marks are strictly private — not even a fellow table member can see another user's marks", async () => {
    const { data: mark } = await userA.client
      .from("marks")
      .insert({ user_id: userA.id, book: "John", chapter: 3, verse: 16, color: "gold" })
      .select()
      .single();

    expect((await userA.client.from("marks").select().eq("id", mark!.id)).data).toHaveLength(1);
    expect((await userB.client.from("marks").select().eq("id", mark!.id)).data).toHaveLength(0);

    const impersonate = await userB.client
      .from("marks")
      .insert({ user_id: userA.id, book: "John", chapter: 3, verse: 17, color: "gold" });
    expect(impersonate.error).not.toBeNull();
  });

  it("plan_progress on a plan shared via the table is visible to fellow members doing that plan", async () => {
    const { data: progress } = await userA.client
      .from("plan_progress")
      .insert({ user_id: userA.id, plan_id: sharedPlanId, day_index: 0 })
      .select()
      .single();

    expect((await userB.client.from("plan_progress").select().eq("user_id", userA.id).eq("plan_id", sharedPlanId)).data).toHaveLength(1);
    expect((await stranger.client.from("plan_progress").select().eq("user_id", userA.id).eq("plan_id", sharedPlanId)).data).toHaveLength(0);
    void progress;
  });

  it("sharing is scoped to the specific shared plan — progress on a different, unshared plan stays private", async () => {
    await userA.client.from("plan_progress").insert({ user_id: userA.id, plan_id: unsharedPlanId, day_index: 0 });
    expect(
      (await userB.client.from("plan_progress").select().eq("user_id", userA.id).eq("plan_id", unsharedPlanId)).data
    ).toHaveLength(0);
  });

  it("shared visibility is read-only — a fellow member can't modify another user's progress", async () => {
    await userB.client
      .from("plan_progress")
      .update({ completed_at: null })
      .eq("user_id", userA.id)
      .eq("plan_id", sharedPlanId)
      .eq("day_index", 0);
    const stillThere = await adminClient()
      .from("plan_progress")
      .select()
      .eq("user_id", userA.id)
      .eq("plan_id", sharedPlanId)
      .eq("day_index", 0)
      .single();
    expect(stillThere.data?.completed_at).not.toBeNull();

    await userB.client.from("plan_progress").delete().eq("user_id", userA.id).eq("plan_id", sharedPlanId).eq("day_index", 0);
    expect(
      (await adminClient().from("plan_progress").select().eq("user_id", userA.id).eq("plan_id", sharedPlanId).eq("day_index", 0)).data
    ).toHaveLength(1);
  });

  it("ai_usage is strictly private, even between table members", async () => {
    await adminClient().from("ai_usage").insert({ user_id: userA.id, count: 3 });
    expect((await userA.client.from("ai_usage").select().eq("user_id", userA.id)).data).toHaveLength(1);
    expect((await userB.client.from("ai_usage").select().eq("user_id", userA.id)).data).toHaveLength(0);
  });
});
