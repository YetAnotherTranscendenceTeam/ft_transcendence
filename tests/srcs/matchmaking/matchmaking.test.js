import { users } from "../../dummy/dummy-account";
import request from "superwstest";
import { createLobby } from "../../dummy/lobbies-player";
import { jwt_matchmaking_secret } from "./env";

import Fastify from "fastify";
import jwt from "@fastify/jwt";

const app = Fastify();
app.register(jwt, {
  secret: jwt_matchmaking_secret,
});

beforeAll(async () => {
  await app.ready();
});

const matchmakingURL = "http://localhost:4044";

describe("queue and unqueue lobby", () => {
  let lobby;
  test("create lobby", async () => {
    lobby = await createLobby(users[0], {
      name: "ranked_1v1",
      team_size: 1,
      team_count: 2,
      ranked: true,
    });
  });
  test("queue lobby", async () => {
    await lobby.ws.sendJson({ event: "queue_start" }).expectJson((message) => {
      expect(message.event).toBe("state_change");
      expect(message.data.state.type).toBe("queued");
    });
  });
  test("unqueue lobby", async () => {
    await lobby.ws
      .wait(50)
      .sendJson({ event: "queue_stop" })
      .expectJson((message) => {
        if (message.event !== "state_change") {
          console.error(message);
        }
        expect(message.event).toBe("state_change");
        expect(message.data.state.type).toBe("waiting");
      });
  });
  test("close lobby", async () => {
    await lobby.close();
  });
});

describe("match making", () => {
  let ws;
  let GameModes;
  test("fetch gamemodes", async () => {
    const response = await request(matchmakingURL).get("/gamemodes").expect(200);
    GameModes = response.body;
  });
  test("connect to matchmaking websocket", async () => {
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
  test.each([
    /* 1 match */
    { lobby_player_count: [1, 1], gamemode: "ranked_1v1", expected_matches: [[0,1]], expected_tolerances: [0] },
    { lobby_player_count: [2, 2], gamemode: "ranked_2v2", expected_matches: [[0,1]], expected_tolerances: [0] },
    { lobby_player_count: [1, 1, 2], gamemode: "ranked_2v2", expected_matches: [[0,1,2]], expected_tolerances: [1] },
    { lobby_player_count: [2, 1, 1], gamemode: "ranked_2v2", expected_matches: [[0,1,2]], expected_tolerances: [1] },
    { lobby_player_count: [1, 1, 1, 1], gamemode: "ranked_2v2", expected_matches: [[0,1,2,3]], expected_tolerances: [0] },
    /* 2 matches */
    { lobby_player_count: [1, 2, 1, 1, 1, 2], gamemode: "ranked_2v2", expected_matches: [[0,2,3,4], [1,5]], expected_tolerances: [0,0] },
    { lobby_player_count: [2, 1, 1, 1, 1, 2], gamemode: "unranked_2v2", expected_matches: [[0,5], [1,2,3,4]], expected_tolerances: [0,0] },
    { lobby_player_count: [1, 1, 1, 1, 2, 2], gamemode: "unranked_2v2", expected_matches: [[0,1,2,3], [4,5]], expected_tolerances: [0,0] },
    /* 3 matches */
    { lobby_player_count: [1, 1, 2, 2, 2, 2, 2], gamemode: "unranked_2v2", expected_matches: [[2,3], [4,5], [0,1,6]], expected_tolerances: [0,0,1] },
    { lobby_player_count: [1, 1, 1, 1, 1, 1, 2, 2, 2], gamemode: "unranked_2v2", expected_matches: [[0,1,2,3], [6,7], [4,5,8]], expected_tolerances: [0,0,1] },
  ])(
    "queue $lobby_player_count.length lobbies and expect $expected_matches.length matche(s) ($gamemode)",
    async ({ lobby_player_count, gamemode, expected_matches, expected_tolerances}) => {
      let account_id = 0;
      const lobbies = lobby_player_count.map((player_count, index) => ({
        players: Array.from({ length: player_count }, () => ({ account_id: account_id++ })),
        mode: GameModes[gamemode],
        joinSecret: `${gamemode}_${index}`,
      }));
      let lobby_count = 0;
      let player_count = 0;
      for (const lobby of lobbies) {
        await ws
          .sendJson({
            event: "queue_lobby",
            data: { lobby },
          })
          .expectJson((message) => {
            expect(message.event).toBe("confirm_queue");
            player_count += lobby.players.length;
            expect(message.data.queue_stats.players).toBe(player_count);
            expect(message.data.queue_stats.lobbies).toBe(++lobby_count);
          });
      }
      for (let i = 0; i < expected_matches.length; i++) {
        const expected_match = expected_matches[i];
        const expected_tolerance = expected_tolerances[i];
        await ws
          .expectJson((message) => {
            expect(message.event).toBe("match");
            expect(message.data.lobbies.length).toBe(expected_match.length);
            for (let lobby of message.data.lobbies) {
              expect(lobby.tolerance).toBe(expected_tolerance);
            }
            for (let i of expected_match) {
              expect(message.data.lobbies.find((other) => other.joinSecret == lobbies[i].joinSecret)).toBeDefined();
            }
          });
      }
    }
  );
  test("close websocket", async () => {
    await ws.close(1000, "test done");
  });
});
