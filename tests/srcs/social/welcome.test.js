import request from "superwstest";
import { createUsers, users } from "../../dummy/dummy-account";
import { apiURL, socialWS } from "../../URLs";

createUsers(1 + 12);

let mainUser;

beforeAll(() => {
  mainUser = users[users.length - 1];
})

describe("Social Websocket Welcome", () => {
  describe("Setup", () => {
    for (let i = 0; i < 6; ++i) {
      it("Send requests", async () => {
        const friendRequest = await request(apiURL)
          .post(`/social/requests/${users[i].account_id}`)
          .set("Authorization", `Bearer ${mainUser.jwt}`)

        expect(friendRequest.statusCode).toEqual(204);
      });
    };

    for (let i = 3; i < 6; ++i) {
      it("Accept requests", async () => {
        const friendRequest = await request(apiURL)
          .post(`/social/requests/${mainUser.account_id}`)
          .set("Authorization", `Bearer ${users[i].jwt}`)

        expect(friendRequest.statusCode).toEqual(204);
      });
    };

    for (let i = 6; i < 9; ++i) {
      it("Block", async () => {
        const friendRequest = await request(apiURL)
          .post(`/social/blocks/${users[i].account_id}`)
          .set("Authorization", `Bearer ${mainUser.jwt}`)

        expect(friendRequest.statusCode).toEqual(204);
      });
    };

    for (let i = 9; i < 12; ++i) {
      it("Get blocked", async () => {
        const friendRequest = await request(apiURL)
          .post(`/social/blocks/${mainUser.account_id}`)
          .set("Authorization", `Bearer ${users[i].jwt}`)

        expect(friendRequest.statusCode).toEqual(204);
      });
    };
  }); // Setup

  it("connect to websocket", async () => {
    const ws = await request(socialWS)
      .ws(`/notify?access_token=${mainUser.jwt}`)
      .expectJson((message) => {
        expect(message.event).toEqual("welcome"),
          expect(message.data).toEqual({
            self: { type: "online" },
            friends: expect.arrayContaining(users.slice(3, 6).map(u => {
              return expect.objectContaining({
                account_id: u.account_id,
                status: expect.any(Object)
              })
            })),
            pending: expect.arrayContaining(users.slice(0, 3).map(u => {
              return expect.objectContaining({
                account_id: u.account_id,
              })
            })),
            blocked: expect.arrayContaining(users.slice(3, 6).map(u => {
              return expect.objectContaining({
                account_id: u.account_id,
                // "truc"
              })
            })),
          })
        message.data.pending.forEach(item => {
          expect(item).not.toHaveProperty('status');
        });
        message.data.blocked.forEach(item => {
          expect(item).not.toHaveProperty('status');
        });
      })
    ws.send(JSON.stringify({ event: "goodbye" }));
  });

}); // Social Websocket Welcome
