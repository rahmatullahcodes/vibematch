import assert from "node:assert/strict";
import * as mockApi from "../src/mocks/mockApi.js";

function randomEmail(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}@mail.com`;
}

async function run() {
  const prefSession = await mockApi.register({
    name: "Pref User",
    email: randomEmail("pref"),
    password: "secret12",
    city: "Delhi",
    age: 24,
  });

  const beforePref = await mockApi.getNotificationPreferences(prefSession.token);
  assert.equal(beforePref.preferences.emailByType.message, true);

  await mockApi.updateNotificationPreferences(prefSession.token, {
    channel: "email",
    type: "message",
    enabled: false,
  });
  const afterPref = await mockApi.getNotificationPreferences(prefSession.token);
  assert.equal(afterPref.preferences.emailByType.message, false);

  const admin = await mockApi.login({ email: "demo@spark.app", password: "demo1234" });
  const reporter = await mockApi.register({
    name: "Reporter User",
    email: randomEmail("reporter"),
    password: "secret12",
    city: "Patna",
    age: 23,
  });
  const offender = await mockApi.register({
    name: "Offender User",
    email: randomEmail("offender"),
    password: "secret12",
    city: "Mumbai",
    age: 25,
  });

  await mockApi.reportUser(reporter.token, {
    targetUserId: offender.user.id,
    reason: "Harassment",
  });

  const queue = await mockApi.getModerationReports(admin.token, { status: "open" });
  const report = queue.reports.find((item) => item.targetUserId === offender.user.id);
  assert.ok(report, "Expected open report for offender");

  await mockApi.resolveModerationReport(admin.token, {
    reportId: report.id,
    action: "suspend",
    note: "Temporary suspension",
    suspendHours: 2,
  });

  let suspendedBlocked = false;
  try {
    await mockApi.login({ email: offender.user.email, password: "secret12" });
  } catch (error) {
    suspendedBlocked = /suspended/i.test(String(error?.message || ""));
  }
  assert.equal(suspendedBlocked, true);

  const dashboard = await mockApi.getAnalyticsDashboard(admin.token);
  assert.equal(typeof dashboard?.metrics?.totalUsers, "number");
  assert.equal(typeof dashboard?.metrics?.chatResponseRate, "number");
  assert.equal(typeof dashboard?.metrics?.matchConversionRate, "number");
  assert.ok(Array.isArray(dashboard?.trends?.dau7d));

  console.log("PHASE2_SMOKE_OK");
}

run().catch((error) => {
  console.error("PHASE2_SMOKE_FAIL", error?.message || error);
  process.exit(1);
});
