import request from "superwstest";
import { createUsers, users } from "../../../dummy/dummy-account";

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

    await new Promise(resolve => setTimeout(resolve, 300));

    const ws = await request(socialUrl)
      .ws(`/notify?access_token=${users[0].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
        expect(message.data.follows).toEqual([
          expect.objectContaining({
            account_id: users[1].account_id,
            profile: expect.objectContaining({
              account_id: users[1].account_id,
              avatar: expect.any(String),
              created_at: expect.any(String),
              updated_at: expect.any(String),
              username: expect.any(String),
            }),
            status: { type: "offline" }
          })
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
          expect.arrayContaining([
            expect.objectContaining({
              account_id: expect.any(Number),
              profile: expect.objectContaining({
                account_id: expect.any(Number),
                avatar: expect.any(String),
                created_at: expect.any(String),
                updated_at: expect.any(String),
                username: expect.any(String),
              }),
              status: { type: "offline" }
            })
          ])
        );
        // Ensure the length of follows matches the expected number
        expect(message.data.follows.length).toBe(users.length - 1);
      })
      .sendJson({ event: "goodbye" });
  });
});
