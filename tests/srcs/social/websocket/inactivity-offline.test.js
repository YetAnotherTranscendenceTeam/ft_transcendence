import request from "superwstest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { inactive, offline } from "../../../../services/social/srcs/utils/activityStatuses";
import { apiURL, socialWS } from "../../../URLs";

createUsers(2);

describe('Inactivity test', () => {
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

  it("goes inactive then offline", async () => {
    const ws1 = await request(socialWS)
      .ws(`/notify?access_token=${users[1].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
      })

    const ws0 = await request(socialWS)
      .ws(`/notify?access_token=${users[0].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
      })
      .expectJson((message) => {
        expect(message.event).toBe("recv_status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: inactive
        });

        ws1.send(JSON.stringify({ event: "goodbye" }));
      })
      .expectJson((message) => {
        expect(message.event).toBe("recv_status");
        expect(message.data).toEqual({
          account_id: users[0].account_id,
          status: inactive
        })
      })
      .expectJson((message) => {
        expect(message.event).toBe("recv_status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: offline
        })
      })
    ws0.send(JSON.stringify({ event: "goodbye" }));
  }, 30000);
});
