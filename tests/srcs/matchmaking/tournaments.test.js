import request from "superwstest";
import { matchmaking_jwt_secret } from "./env";
import { GameModes, matchmakingURL } from "./gamemodes";

import Fastify from "fastify";
import jwt from "@fastify/jwt";

const app = Fastify();
app.register(jwt, {
  secret: matchmaking_jwt_secret,
});

beforeAll(async () => {
  await app.ready();
});

describe("direct match making", () => {
  let ws;
  it("connect to matchmaking websocket", async () => {
    ws = request(matchmakingURL)
      .ws("/lobbieconnection")
      .sendJson({
        event: "handshake",
        data: {
          jwt: app.jwt.sign({ GameModes }),
        },
      })
      .expectJson((message) => {
        expect(message.event).toBe("handshake");
      });
  });
  it("queue a 2vs2 tournament", async () => {
    const lobby = {
      team_names: [],
      players: [{ account_id: 0 }, { account_id: 1 }, { account_id: 2 }, { account_id: 3 }, { account_id: 4 }, { account_id: 5 }],
      mode: GameModes["custom_2v2"],
      join_secret: "2v2_0",
    };
    await ws
      .sendJson({
        event: "queue_lobby",
        data: { lobby },
      })
      .expectJson((message) => {
        expect(message.event).toBe("confirm_queue");
        expect(message.data.queue_stats.players).toBe(6);
        expect(message.data.queue_stats.lobbies).toBe(1);
      })
      .expectJson((message) => {
        expect(message.event).toBe("match");
      });
  })
  it("close matchmaking websocket", async () => {
    await ws.close();
  });
});
