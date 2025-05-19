import request from "superwstest";
import { MATCHMAKING_SECRET, MATCH_MANAGEMENT_SECRET, PONG_SECRET } from "./env";
import { matchmaking_tests } from "./matches-tests";
import { GameModes, matchmakingURL } from "./gamemodes";
import { createUsers, users } from "../../dummy/dummy-account";

import Fastify from "fastify";
import jwt from "@fastify/jwt";
import { finishMatch } from "./finishmatch";

const app = Fastify();
app.register(jwt, { secret: MATCHMAKING_SECRET });
app.register(jwt, { secret: MATCH_MANAGEMENT_SECRET, namespace: "match_management" });
app.register(jwt, { secret: PONG_SECRET, namespace: "pong" });

beforeAll(async () => {
  await app.ready();
});

createUsers(2);

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

describe("already in a match and queue for another", () => {
  let match_id;
  test("create match", async () => {
    const lobby = {
      team_names: [],
      players: Array.from({ length: 2 }, (_, index) => ({
        account_id: users[index].account_id,
        profile: users[index].profile,
      })),
      mode: GameModes["custom_1v1"],
      join_secret: "custom_1v1_2",
    };

    await ws
      .sendJson({
        event: "queue_lobby",
        data: { lobby },
      })
      .expectJson((message) => {
        expect(message.event).toBe("confirm_queue");
      })
      .expectJson((message) => {
        expect(message.event).toBe("match");
        expect(message.data.match.match.players.length).toBe(2);
        match_id = message.data.match.match.match_id;
      });
  });
  test("queue for another match", async () => {
    const lobby = {
      team_names: [],
      players: Array.from({ length: 2 }, (_, index) => ({
        account_id: users[index].account_id,
        profile: users[index].profile,
      })),
      mode: GameModes["custom_1v1"],
      join_secret: "custom_1v1_2",
    };

    await ws
      .sendJson({
        event: "queue_lobby",
        data: { lobby },
      })
  });
  it("expect queue failure", async () => {
    await ws.expectJson((message) => {
      expect(message.event).toBe("confirm_unqueue");
    });
  });
  it("finish match", async () => {
    await finishMatch(app, match_id, 1);
    await ws.expectJson((message) => {
      expect(message.event).toBe("match_update");
      expect(message.data.match_id).toBe(match_id);
      expect(message.data.state).toBe(2);
    });
  });
  it("queue for another match", async () => {
    const lobby = {
      team_names: [],
      players: Array.from({ length: 2 }, (_, index) => ({
        account_id: users[index].account_id,
        profile: users[index].profile,
      })),
      mode: GameModes["custom_1v1"],
      join_secret: "custom_1v1_2",
    };

    await ws
      .sendJson({
        event: "queue_lobby",
        data: { lobby },
      })
      .expectJson((message) => {
        expect(message.event).toBe("confirm_queue");
      });
  });
  it("expect match", async () => {
    await ws.expectJson((message) => {
      expect(message.event).toBe("match");
      expect(message.data.match.match.players.length).toBe(2);
      match_id = message.data.match.match.match_id;
    });
  });
  it("finish match", async () => {
    await finishMatch(app, match_id, 1);
  });
});

it("disconnect from matchmaking websocket", async () => {
  await ws.close();
});
