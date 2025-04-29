import request from "superwstest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { apiURL, socialWS } from "../../../URLs";
import { SocialDummy } from "../../../dummy/social-dummy";

createUsers(3);

const event = "send_lobby_request";

describe('Lobby invitations', () => {
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

  describe('invalid payload', () => {
    it("no data", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
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
        })

      setTimeout(() => {
        ws1.send(JSON.stringify({
          event: event,
          data: {
            account_id: users[0].account_id
          }
        }));
      }, 3000);

      const ws0 = await request(socialWS)
        .ws(`/notify?access_token=${users[0].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
        }).expectJson((message) => {
          expect(message).toEqual({
            event: "recv_lobby_request",
            data: {
              username: users[1].username,
              account_id: users[1].account_id
            }
          })
        });

      ws0.send(JSON.stringify({ event: "goodbye" }));
      ws1.send(JSON.stringify({ event: "goodbye" }));
    });

    it("not a friend target", async () => {
      const dummy = new SocialDummy(users[0]);
      dummy.connect();
      dummy.send({
        event: event,
        data: {
          account_id: users[2].account_id
        }
      });

      await dummy.expectEvent("error", {
        code: "USER_UNAVAILABLE",
        details: { account_id: users[2].account_id },
        message: "The requested user is currently offline or not accessible"
      });

      dummy.disconnect();
    });
  });
});
