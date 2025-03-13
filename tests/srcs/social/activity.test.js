import request from "superwstest";
import { createUsers, users } from "../../dummy/dummy-accounts";

createUsers(5);
const socialUrl = 'ws://127.0.0.1:4123';
const mainUrl = "https://127.0.0.1:7979";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Social websocket', () => {

  it("connect / disconnect", async () => {
    const ws = await request(socialUrl)
      .ws(`/notify?access_token=${users[0].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
        expect(message.data.follows).toEqual([])
      })
      .sendJson({ event: "goodbye" });
  });

  it("with an offline friends", async () => {
    await request(mainUrl)
      .post(`/social/follows/${users[1].account_id}`)
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect(204);

    const ws = await request(socialUrl)
      .ws(`/notify?access_token=${users[0].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
        expect(message.data.follows).toEqual([
          { id: users[1].account_id, status: "offline" },
        ])
      })
      .sendJson({ event: "goodbye" });
  });

  it("with multiple offline friends", async () => {
    for (let i = 2; i < users.length; ++i) {
      await request(mainUrl)
        .post(`/social/follows/${users[i].account_id}`)
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(204);
    }

    const ws = await request(socialUrl)
      .ws(`/notify?access_token=${users[0].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
        expect(message.data.follows).toEqual(
          expect.arrayContaining(
            users.slice(1).map(u => ({
              id: u.account_id,
              status: "offline"
            }))
          )
        );
        expect(message.data.follows.length).toBe(users.length - 1);
      })
      .sendJson({ event: "goodbye" });
  });
});
