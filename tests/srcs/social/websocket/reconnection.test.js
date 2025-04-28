import request from "superwstest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { inactive, online } from "../../../../services/social/srcs/utils/activityStatuses";
import { apiURL, socialWS } from "../../../URLs";

createUsers(2);

describe('Social websocket', () => {
  beforeAll(async () => {
    await request(apiURL)
      .post(`/social/requests/${users[1].account_id}`)
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect(204);

    await request(apiURL)
      .post(`/social/requests/${users[0].account_id}`)
      .set('Authorization', `Bearer ${users[1].jwt}`)
      .expect(204);
  });

  it("reconnection", async () => {
    const ws1 = await request(socialWS)
      .ws(`/notify?access_token=${users[1].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
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

        setTimeout(async () => {
          ws2 = await request(socialWS)
            .ws(`/notify?access_token=${users[1].jwt}`)
            .expectJson((message) => {
              expect(message.event).toBe("welcome");

            }).sendJson({ event: "send_status", data: statusUpdate })
        }, 4000)
      })
      .expectJson((message) => {
        expect(message.event).toBe("recv_status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: statusUpdate
        });
      }).expectJson((message) => {
        expect(message.event).toBe("recv_status");
        expect(message.data).toEqual({
          account_id: users[0].account_id,
          status: inactive
        });
      }).expectJson((message) => {
        expect(message.event).toBe("recv_status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: inactive
        });
      })
    ws2.send(JSON.stringify({ event: "goodbye" }));
    ws0.send(JSON.stringify({ event: "goodbye" }));
  }, 25000);
});
