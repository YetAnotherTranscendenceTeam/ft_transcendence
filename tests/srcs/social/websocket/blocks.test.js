import { createUsers, users } from "../../../dummy/dummy-account";
import { emptyWelcome, SocialDummy } from "../../../dummy/social-dummy";

createUsers(2);

describe('Block tests', () => {

  let user1;
  let user2;

  beforeAll(async () => {
    user1 = new SocialDummy(users[0]);
    user1.connect(emptyWelcome);
    user2 = new SocialDummy(users[1]);
    user2.connect(emptyWelcome);
  });

  afterAll(async () => {
    await user1.disconnect();
    await user2.disconnect();
  })

  it("1 send friend request to 2", async () => {
    let response = await user1.sendFriendRequest(user2);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_new_friend_request", { ...user2.me(), sender: user1.id });
    await user2.expectEvent("recv_new_friend_request", { ...user1.me(), sender: user1.id });
  });

  it("2 blocks 1", async () => {
    let response = await user2.block(user1);
    expect(response.statusCode).toBe(204);

    await user2.expectEvent("recv_delete_friend_request", { account_id: user1.id, sender: user1.id });
    await user1.expectEvent("recv_delete_friend_request", { account_id: user2.id, sender: user1.id });
    await user2.expectEvent("recv_new_block", { ...user1.me() });
  });

  it("1 blocks 2", async () => {
    let response = await user1.block(user2);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_new_block", { ...user2.me() });
  });

  it("1 unblocks 2", async () => {
    let response = await user1.unblock(user2);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_delete_block", { account_id: user2.id });
  });

  it("2 unblocks 1", async () => {
    let response = await user2.unblock(user1);
    expect(response.statusCode).toBe(204);

    await user2.expectEvent("recv_delete_block", { account_id: user1.id });
  });

  it("all socials should be empty", async () => {
    user1.disconnect();
    user1.connect(emptyWelcome);
    user2.disconnect();
    user2.connect(emptyWelcome);
  });

  it("block while pending sent", async () => {
    let response = await user1.sendFriendRequest(user2);
    expect(response.statusCode).toBe(204);

    await user2.expectEvent("recv_new_friend_request", { ...user1.me(), sender: user1.id });
    await user1.expectEvent("recv_new_friend_request", { ...user2.me(), sender: user1.id });

    response = await user1.block(user2);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_delete_friend_request", { account_id: user2.id, sender: user1.id });
    await user1.expectEvent("recv_new_block", { ...user2.me() });
    await user2.expectEvent("recv_delete_friend_request", { account_id: user1.id, sender: user1.id });
  });

  it("block while pending received", async () => {
    let response = await user1.unblock(user2);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_delete_block", { account_id: user2.id });

    response = await user1.sendFriendRequest(user2);
    expect(response.statusCode).toBe(204);

    await user2.expectEvent("recv_new_friend_request", { ...user1.me(), sender: user1.id });
    await user1.expectEvent("recv_new_friend_request", { ...user2.me(), sender: user1.id });

    response = await user2.block(user1);
    expect(response.statusCode).toBe(204);

    await user2.expectEvent("recv_delete_friend_request", { account_id: user1.id, sender: user1.id });
    await user1.expectEvent("recv_delete_friend_request", { account_id: user2.id, sender: user1.id });
    await user2.expectEvent("recv_new_block", { ...user1.me() });
  });

  it("reset relationships", async () => {
    let response = await user2.unblock(user1);
    expect(response.statusCode).toBe(204);

    user1.disconnect();
    user1.connect(emptyWelcome);
    user2.disconnect();
    user2.connect(emptyWelcome);
  });

  it("block while being friends", async () => {
    await user1.newFriend(user2);

    let response = await user1.block(user2);
    expect(response.statusCode).toBe(204);

    await user2.expectEvent("recv_delete_friend", { account_id: user1.id });

    await user1.expectEvent("recv_delete_friend", { account_id: user2.id });
    await user1.expectEvent("recv_new_block", { ...user2.me(), account_id: user2.id });
  });

  it("reset relationships", async () => {
    let response = await user1.unblock(user2);
    expect(response.statusCode).toBe(204);

    user1.disconnect();
    user1.connect(emptyWelcome);
    user2.disconnect();
    user2.connect(emptyWelcome);
  });

  it("inverse block while being friends", async () => {
    await user2.newFriend(user1);

    let response = await user2.block(user1);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_delete_friend", { account_id: user2.id });

    await user2.expectEvent("recv_delete_friend", { account_id: user1.id });
    await user2.expectEvent("recv_new_block", { ...user1.me(), account_id: user1.id });
  });
});
