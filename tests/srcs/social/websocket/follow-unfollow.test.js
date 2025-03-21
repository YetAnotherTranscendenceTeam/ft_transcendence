import request from "superwstest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { online, offline } from "../../../../services/social/srcs/utils/activityStatuses";

createUsers(2);
const socialWS = 'ws://127.0.0.1:4123';
const mainUrl = "https://127.0.0.1:7979";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('following events', () => {
  it("offline friend", async () => {
    const ws0 = await request(socialWS)
      .ws(`/notify?access_token=${users[0].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
        expect(message.data.follows).toEqual([])
        // Follow
        setTimeout(async () => {
          await request(mainUrl)
            .post(`/social/follows/${users[1].account_id}`)
            .set('Authorization', `Bearer ${users[0].jwt}`)
            .expect(204);
        }, 1000);
      })
      .expectJson((message) => {
        expect(message.event).toBe("follow");
        expect(message.data).toEqual(
          expect.objectContaining({
            account_id: users[1].account_id,
            profile: expect.objectContaining({
              account_id: users[1].account_id,
              avatar: expect.any(String),
              created_at: expect.any(String),
              updated_at: expect.any(String),
              username: expect.any(String),
            }),
            status: offline
          }));
        // Unfollow
        setTimeout(async () => {
          await request(mainUrl)
            .delete(`/social/follows/${users[1].account_id}`)
            .set('Authorization', `Bearer ${users[0].jwt}`)
            .expect(204);
        });
      }).expectJson((message) => {
        expect(message.event).toBe("unfollow");
        expect(message.data).toEqual({ account_id: users[1].account_id });
      })
    ws0.send(JSON.stringify({ event: "goodbye" }));
  });

  it("online friend", async () => {
    const ws1 = await request(socialWS)
      .ws(`/notify?access_token=${users[1].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
        expect(message.data.follows).toEqual([])
      })

    const ws0 = await request(socialWS)
      .ws(`/notify?access_token=${users[0].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
        expect(message.data.follows).toEqual([])
        // Follow
        setTimeout(async () => {
          await request(mainUrl)
            .post(`/social/follows/${users[1].account_id}`)
            .set('Authorization', `Bearer ${users[0].jwt}`)
            .expect(204);
        }, 1000);
      })
      .expectJson((message) => {
        expect(message.event).toBe("follow");
        expect(message.data).toEqual(
          expect.objectContaining({
            account_id: users[1].account_id,
            profile: expect.objectContaining({
              account_id: users[1].account_id,
              avatar: expect.any(String),
              created_at: expect.any(String),
              updated_at: expect.any(String),
              username: expect.any(String),
            }),
            status: online
          }));
        // Unfollow
        setTimeout(async () => {
          await request(mainUrl)
            .delete(`/social/follows/${users[1].account_id}`)
            .set('Authorization', `Bearer ${users[0].jwt}`)
            .expect(204);
        });
      }).expectJson((message) => {
        expect(message.event).toBe("unfollow");
        expect(message.data).toEqual({ account_id: users[1].account_id });
      })
    ws1.send(JSON.stringify({ event: "goodbye" }));
    ws0.send(JSON.stringify({ event: "goodbye" }));
  });
});
