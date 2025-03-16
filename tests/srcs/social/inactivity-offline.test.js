import request from "superwstest";
import { createUsers, users } from "../../dummy/dummy-account";

createUsers(2);
const socialUrl = 'ws://127.0.0.1:4123';
const mainUrl = "https://127.0.0.1:7979";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Inactivity test', () => {
  it("follow", async () => {
    await request(mainUrl)
      .post(`/social/follows/${users[1].account_id}`)
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect(204);
  });

  it("goes inactive then offline", async () => {
    const ws1 = await request(socialUrl)
      .ws(`/notify?access_token=${users[1].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
        expect(message.data.follows).toEqual([])
      })

    const ws0 = await request(socialUrl)
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
            status: "online"
          })
        ])
      })
      .expectJson((message) => {
        expect(message.event).toBe("status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: "inactive"
        });

        ws1.send(JSON.stringify({ event: "goodbye" }));
      })
      .expectJson((message) => {
        expect(message.event).toBe("status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: "offline"
        })
      })
      ws0.send(JSON.stringify({ event: "goodbye" }));
  }, 30000);
});
