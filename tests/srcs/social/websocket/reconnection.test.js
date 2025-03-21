import request from "superwstest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { inactive, online } from "../../../../services/social/srcs/utils/activityStatuses";
import { apiURL } from "../../../URLs";

createUsers(2);
const socialWS = 'ws://127.0.0.1:4123';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Social websocket', () => {
  it("follow", async () => {
    await request(apiURL)
      .post(`/social/follows/${users[1].account_id}`)
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect(204);
  });

  it("reconnection", async () => {
    const ws1 = await request(socialWS)
      .ws(`/notify?access_token=${users[1].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
        expect(message.data.follows).toEqual([])
      })

    setTimeout(() => {
      ws1.send(JSON.stringify({ event: "goodbye" }));
    }, 2000);

    const statusUpdate = { type: "ingame", data: { something: "astring" } };

    let ws2;
    const ws0 = await request(socialWS)
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
        setTimeout(async () => {
          ws2 = await request(socialWS)
            .ws(`/notify?access_token=${users[1].jwt}`)
            .expectJson((message) => {
              expect(message.event).toBe("welcome");
              expect(message.data.follows).toEqual([])
            }).sendJson({ event: "update_status", data: statusUpdate })
        }, 2000)
      })
      .expectJson((message) => {
        expect(message.event).toBe("status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: statusUpdate
        });
      }).expectJson((message) => {
        expect(message.event).toBe("status");
        expect(message.data).toEqual({
          account_id: users[0].account_id,
          status: inactive
        });
      }).expectJson((message) => {
        expect(message.event).toBe("status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: inactive
        });
      })
    ws2.send(JSON.stringify({ event: "goodbye" }));
    ws0.send(JSON.stringify({ event: "goodbye" }));
  }, 25000);
});
