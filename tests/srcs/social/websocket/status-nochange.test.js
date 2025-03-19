import request from "superwstest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { online } from "../../../../services/social/srcs/utils/activityStatuses";

createUsers(2);
const socialUrl = 'ws://127.0.0.1:4123';
const mainUrl = "https://127.0.0.1:7979";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Status changes', () => {
  it("follow", async () => {
    await request(mainUrl)
      .post(`/social/follows/${users[1].account_id}`)
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect(204);
  });

  it("status change", async () => {
    const ws1 = await request(socialUrl)
      .ws(`/notify?access_token=${users[1].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
        expect(message.data.follows).toEqual([])
      })

    const statusUpdate = { type: "inlobby", data: { something: "astring" }};

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
            status: online
          })
        ])
        setTimeout(() => {
          ws1.send(JSON.stringify({ event: "update_status", data: statusUpdate }));
        }, 1000)
      })
      .expectJson((message) => {
        expect(message.event).toBe("status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: statusUpdate
        });
        setTimeout(() => {
          ws1.send(JSON.stringify({ event: "update_status", data: online }));
        }, 2000)
      }).expectJson((message) => {
        expect(message.event).toBe("status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: online
        });
      })
      ws1.send(JSON.stringify({ event: "goodbye" }));
      ws0.send(JSON.stringify({ event: "goodbye" }));
  });
});
