import request from "superwstest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { online } from "../../../../services/social/srcs/utils/activityStatuses";
import { apiURL, socialWS } from "../../../URLs";

createUsers(2);

describe('Status changes', () => {
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

  it("status change", async () => {
    const ws1 = await request(socialWS)
      .ws(`/notify?access_token=${users[1].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
      })

    const statusUpdate = { type: "inlobby", data: { something: "astring" }};

    const ws0 = await request(socialWS)
      .ws(`/notify?access_token=${users[0].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");

        setTimeout(() => {
          ws1.send(JSON.stringify({ event: "send_status", data: statusUpdate }));
        }, 1000)
      })
      .expectJson((message) => {
        expect(message.event).toBe("recv_status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: statusUpdate
        });
        setTimeout(() => {
          ws1.send(JSON.stringify({ event: "send_status", data: online }));
        }, 2000)
      }).expectJson((message) => {
        expect(message.event).toBe("recv_status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: online
        });
      })
      ws1.send(JSON.stringify({ event: "goodbye" }));
      ws0.send(JSON.stringify({ event: "goodbye" }));
  });
});
