import assert from "node:assert/strict";
import * as mockApi from "../src/mocks/mockApi.js";

function randomEmail(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}@mail.com`;
}

async function run() {
  const userA = await mockApi.register({
    name: "Phase3 User A",
    email: randomEmail("phase3_a"),
    password: "secret12",
    city: "Delhi",
    age: 25,
    interests: "Music, Travel, Coffee",
  });

  const userB = await mockApi.register({
    name: "Phase3 User B",
    email: randomEmail("phase3_b"),
    password: "secret12",
    city: "Mumbai",
    age: 27,
    interests: "Music, Movies, Travel",
  });

  await mockApi.sendSwipeAction(userA.token, {
    profileId: `profile_${userB.user.id}`,
    action: "like",
  });
  await mockApi.sendSwipeAction(userB.token, {
    profileId: `profile_${userA.user.id}`,
    action: "like",
  });

  const searchResult = await mockApi.searchDiscoverProfiles(userA.token, {
    query: "phase3",
    minAge: 22,
    maxAge: 40,
  });
  assert.ok(Array.isArray(searchResult.results));
  assert.ok(searchResult.total >= 1);

  const recommendations = await mockApi.getSmartRecommendations(userA.token);
  assert.ok(Array.isArray(recommendations.recommendations));
  assert.ok(recommendations.recommendations.length >= 1);

  const discover = await mockApi.getDiscoverFeed(userA.token);
  assert.ok(Array.isArray(discover.posts));
  assert.ok(discover.posts.length >= 1);

  const targetPost = discover.posts[0];
  const postComment = await mockApi.addPostComment(userA.token, {
    postId: targetPost.id,
    text: "Great update for phase 3.",
  });
  assert.equal(typeof postComment.comment?.id, "string");
  assert.ok(postComment.commentsCount >= 1);

  const sharedPost = await mockApi.sharePost(userA.token, {
    postId: targetPost.id,
    channel: "chat",
  });
  assert.ok(sharedPost.shareCount >= 1);

  const reels = await mockApi.getReelsFeed(userA.token);
  assert.ok(Array.isArray(reels.reels));
  assert.ok(reels.reels.length >= 1);

  const targetReel = reels.reels[0];
  const reelComment = await mockApi.addReelComment(userA.token, {
    reelId: targetReel.id,
    text: "Nice reel flow.",
  });
  assert.equal(typeof reelComment.comment?.id, "string");
  assert.ok(reelComment.commentsCount >= 1);

  const sharedReel = await mockApi.shareReel(userA.token, {
    reelId: targetReel.id,
    channel: "copy_link",
  });
  assert.ok(sharedReel.shareCount >= 1);

  const callsBefore = await mockApi.getCallDashboard(userA.token);
  assert.ok(Array.isArray(callsBefore.contacts));
  assert.ok(callsBefore.contacts.some((contact) => contact.peerUserId === userB.user.id));

  const startedCall = await mockApi.startCallSession(userA.token, {
    peerUserId: userB.user.id,
    type: "video",
  });
  assert.equal(startedCall.session?.status, "ringing");

  const acceptedCall = await mockApi.respondCallSession(userB.token, {
    sessionId: startedCall.session.id,
    action: "accept",
  });
  assert.equal(acceptedCall.session?.status, "accepted");

  const endedCall = await mockApi.respondCallSession(userA.token, {
    sessionId: startedCall.session.id,
    action: "end",
  });
  assert.equal(endedCall.session?.status, "ended");

  const callsAfter = await mockApi.getCallDashboard(userA.token);
  assert.ok(Array.isArray(callsAfter.recentSessions));
  assert.ok(callsAfter.recentSessions.some((session) => session.id === startedCall.session.id));

  console.log("PHASE3_SMOKE_OK");
}

run().catch((error) => {
  console.error("PHASE3_SMOKE_FAIL", error?.message || error);
  process.exit(1);
});
