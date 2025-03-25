import request from "superwstest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { apiURL, socialWS } from "../../../URLs";

createUsers(2);

const event = "send_lobby_request";

describe('Lobby invitations', () => {
  it("follow", async () => {
    await request(apiURL)
      .post(`/social/follows/${users[0].account_id}`)
      .set('Authorization', `Bearer ${users[1].jwt}`)
      .expect(204);
  });

  describe('invalid payload', () => {
    it("no data", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(1)
        })
        .sendJson({ event: event })
        .expectJson((message) => {
          expect(message.event).toBe("error");
          expect(message.data.code).toEqual("INVALID_EVENT")
        })
        .sendJson({ event: "goodbye" });
    });

    it("empty data", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(1)
        })
        .sendJson({ event: event, data: {} })
        .expectJson((message) => {
          expect(message.event).toBe("error");
          expect(message.data.code).toEqual("INVALID_EVENT")
        })
        .sendJson({ event: "goodbye" });
    });

    it("extra param", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(1)
        })
        .sendJson({ event: event, data: { account_id: users[1].account_id, extra: "param" } })
        .expectJson((message) => {
          expect(message.event).toBe("error");
          expect(message.data.code).toEqual("INVALID_EVENT");
        })
        .sendJson({ event: "goodbye" });


    });

    it("non integer account id", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(1);
        })
        .sendJson({ event: event, data: { account_id: "string" } })
        .expectJson((message) => {
          expect(message.event).toBe("error");
          expect(message.data.code).toEqual("INVALID_EVENT");
        })
        .sendJson({ event: "goodbye" });
    });
  });

  describe('valid payload but invalid target', () => {
    it("user not online", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(1)
        })
        .sendJson({ event: event, data: { account_id: users[0].account_id } })
        .expectJson((message) => {
          expect(message.event).toBe("error");
          expect(message.data.code).toEqual("USER_UNAVAILABLE")
        })
        .sendJson({ event: "goodbye" });
    });

    it("self-invite", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(1)
        })
        .sendJson({ event: event, data: { account_id: users[1].account_id } })
        .expectJson((message) => {
          expect(message.event).toBe("error");
          expect(message.data.code).toEqual("USER_UNAVAILABLE")
        })
        .sendJson({ event: "goodbye" });
    });
  });

  describe('valid payload', () => {
    it("valid target", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(1)
        })

      setTimeout(() => {
        ws1.send(JSON.stringify({ event: event, data: { account_id: users[0].account_id } }));
      }, 3000);

      const ws0 = await request(socialWS)
        .ws(`/notify?access_token=${users[0].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(0)
        }).expectJson((message) => {
          expect(message).toEqual({
            event: "receive_lobby_request",
            data: {
              username: users[1].username,
              account_id: users[1].account_id
            }
          })
        });

      ws0.send(JSON.stringify({ event: "goodbye" }));
      ws1.send(JSON.stringify({ event: "goodbye" }));

    });
  });
});
