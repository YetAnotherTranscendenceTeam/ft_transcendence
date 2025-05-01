import request from "superwstest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { apiURL, socialWS } from "../../../URLs";
import { createLobby } from "../../../dummy/lobbies-player";

createUsers(2);

describe('Status changes', () => {
  let lobby;

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

    const statusUpdate = {
      type: "inlobby",
      data: {
        player_ids: [users[1].account_id],
        gamemode: {
          name: "unranked_2v2",
          team_count: 2,
          team_size: 2,
          type: "unranked",
        },
      }
    };

    const ws0 = await request(socialWS)
      .ws(`/notify?access_token=${users[0].jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("welcome");
        setTimeout(async () => {
          lobby = await createLobby(users[1]);
        }, 1000)
      })
      .expectJson((message) => {
        expect(message.event).toBe("recv_status");
        expect(message.data).toEqual({
          account_id: users[1].account_id,
          status: statusUpdate
        });
      })
    ws1.send(JSON.stringify({ event: "goodbye" }));
    ws0.send(JSON.stringify({ event: "goodbye" }));
    lobby.close();
  });
});
