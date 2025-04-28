import { online } from "../../../../services/social/srcs/utils/activityStatuses";
import { createUsers, users } from "../../../dummy/dummy-account";
import { SocialDummy } from "../../../dummy/social-dummy";

createUsers(2);

describe('Friend requests', () => {
  let user1;
  let user2;

  beforeAll(async () => {
    user1 = new SocialDummy(users[0]);
    user1.connect();
    user2 = new SocialDummy(users[1]);
    user2.connect();
  });

  afterAll(async () => {
    await user1.disconect();
    await user2.disconect();
  })

  it("1 send friend request to 2", async () => {
    let response = await user1.sendFriendRequest(user2);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_new_friend_request", { ...user2.me(), sender: user1.id });
    await user2.expectEvent("recv_new_friend_request", { ...user1.me(), sender: user1.id });
  });

  it("1 cancel it", async () => {
    let response = await user1.cancelFriendRequest(user2);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_delete_friend_request", { account_id: user2.id, sender: user1.id });
    await user2.expectEvent("recv_delete_friend_request", { account_id: user1.id, sender: user1.id });
  });

  it("1 resend friend request to 2", async () => {
    let response = await user1.sendFriendRequest(user2);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_new_friend_request", { ...user2.me(), sender: user1.id });
    await user2.expectEvent("recv_new_friend_request", { ...user1.me(), sender: user1.id });
  });

  it("2 refuses it", async () => {
    let response = await user2.cancelFriendRequest(user1);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_delete_friend_request", { account_id: user2.id, sender: user1.id });
    await user2.expectEvent("recv_delete_friend_request", { account_id: user1.id, sender: user1.id });
  });

  it("1 send friend request to 2", async () => {
    let response = await user1.sendFriendRequest(user2);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_new_friend_request", { ...user2.me(), sender: user1.id });
    await user2.expectEvent("recv_new_friend_request", { ...user1.me(), sender: user1.id });
  });

  it("2 send friend request to 1 - friendship created", async () => {
    let response = await user2.sendFriendRequest(user1);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_new_friend", { ...user2.me({ status: online }) });
    await user2.expectEvent("recv_new_friend", { ...user1.me({ status: online }) });
  });

  it("2 remove friendship", async () => {
    let response = await user2.removeFriend(user1);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_delete_friend", { account_id: user2.id });
    await user2.expectEvent("recv_delete_friend", { account_id: user1.id });
  });

  it("1 request -> 2 accept -> 2 refuse", async () => {
    let response = await user1.sendFriendRequest(user2);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_new_friend_request", { ...user2.me(), sender: user1.id });
    await user2.expectEvent("recv_new_friend_request", { ...user1.me(), sender: user1.id });

    response = await user2.sendFriendRequest(user1);
    expect(response.statusCode).toBe(204);

    await user1.expectEvent("recv_new_friend", { ...user2.me({ status: online }) });
    await user2.expectEvent("recv_new_friend", { ...user1.me({ status: online }) });

    response = await user2.cancelFriendRequest(user1);
    expect(response.statusCode).toBe(404);

  });

});
