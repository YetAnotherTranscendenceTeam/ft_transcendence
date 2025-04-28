import request from "superwstest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { apiURL, socialWS } from "../../../URLs";

createUsers(2);

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
        .sendJson({ event: "send_lobby_invite" })
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
        .sendJson({ event: "send_lobby_invite", data: {} })
        .expectJson((message) => {
          expect(message.event).toBe("error");
          expect(message.data.code).toEqual("INVALID_EVENT")
        })
        .sendJson({ event: "goodbye" });
    });

    it("only account id", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(1)
        })
        .sendJson({ event: "send_lobby_invite", data: { account_id: users[1].account_id } })
        .expectJson((message) => {
          expect(message.event).toBe("error");
          expect(message.data.code).toEqual("INVALID_EVENT")
        })
        .sendJson({ event: "goodbye" });
    });

    it("missing join secret", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(1)
        })
        .sendJson({ event: "send_lobby_invite", data: { account_id: users[1].account_id, gamemode: {} } })
        .expectJson((message) => {
          expect(message.event).toBe("error");
          expect(message.data.code).toEqual("INVALID_EVENT")
        })
        .sendJson({ event: "goodbye" });
    });

    it("non integer account id", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(1)
        })
        .sendJson({ event: "send_lobby_invite", data: { account_id: "string", gamemode: {}, join_secret: "a-secret" } })
        .expectJson((message) => {
          expect(message.event).toBe("error");
          expect(message.data.code).toEqual("INVALID_EVENT")
        })
        .sendJson({ event: "goodbye" });
    });

    it("non object gamemode", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(1)
        })
        .sendJson({ event: "send_lobby_invite", data: { account_id: users[1].account_id, gamemode: 45, join_secret: "a-secret" } })
        .expectJson((message) => {
          expect(message.event).toBe("error");
          expect(message.data.code).toEqual("INVALID_EVENT")
        })
        .sendJson({ event: "goodbye" });
    });

    it("non string joind_secret", async () => {
      const ws1 = await request(socialWS)
        .ws(`/notify?access_token=${users[1].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(1)
        })
        .sendJson({ event: "send_lobby_invite", data: { account_id: users[1].account_id, gamemode: {}, join_secret: {} } })
        .expectJson((message) => {
          expect(message.event).toBe("error");
          expect(message.data.code).toEqual("INVALID_EVENT")
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
        .sendJson({ event: "send_lobby_invite", data: { account_id: users[0].account_id, gamemode: {}, join_secret: "a-secret" } })
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
        .sendJson({ event: "send_lobby_invite", data: { account_id: users[1].account_id, gamemode: {}, join_secret: "a-secret" } })
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
          const event = { event: "send_lobby_invite", data: { account_id: users[0].account_id, gamemode: { example: "2v2" }, join_secret: "a-secret" } };
          ws1.send(JSON.stringify(event))
        }, 3000);

      const ws0 = await request(socialWS)
        .ws(`/notify?access_token=${users[0].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows.length).toEqual(0)
        }).expectJson((message) => {
          expect(message).toEqual({
            event: "recv_lobby_invite",
            data: {
              username: users[1].username,
              gamemode: { example: "2v2" },
              join_secret: "a-secret",
            }
          })
        });

        ws0.send(JSON.stringify({ event: "goodbye" }));
        ws1.send(JSON.stringify({ event: "goodbye" }));

    });
  });

  // it("send ", async () => {
  //   const ws1 = await request(socialWS)
  //     .ws(`/notify?access_token=${users[1].jwt}`)
  //     .expectJson((message) => {
  //       expect(message.event).toBe("welcome");
  //       expect(message.data.follows.length).toEqual(1)

  //       setTimeout(() => {
  //         ws1.send(JSON.stringify({ event: "ping" }));
  //       }, 9000)
  //       setTimeout(() => {
  //         ws1.send(JSON.stringify({ event: "goodbye" }));
  //       }, 15000)
  //     })

  //   const ws0 = await request(socialWS)
  //     .ws(`/notify?access_token=${users[0].jwt}`)
  //     .expectJson((message) => {
  //       expect(message.event).toBe("welcome");
  //       expect(message.data.follows).toEqual([
  //         expect.objectContaining({
  //           account_id: users[1].account_id,
  //           profile: expect.objectContaining({
  //             account_id: users[1].account_id,
  //             avatar: expect.any(String),
  //             created_at: expect.any(String),
  //             updated_at: expect.any(String),
  //             username: expect.any(String),
  //           }),
  //           status: online
  //         })
  //       ])
  //     })
  //     .expectJson((message) => {
  //       expect(message.event).toBe("recv_status");
  //       expect(message.data).toEqual({
  //         account_id: users[0].account_id,
  //         status: inactive
  //       });
  //     })
  //     .expectJson((message) => {
  //       expect(message.event).toBe("recv_status");
  //       expect(message.data).toEqual({
  //         account_id: users[1].account_id,
  //         status: offline
  //       });
  //     })
  //   ws0.send(JSON.stringify({ event: "goodbye" }));
  // }, 30000);
});
