import request from "superwstest";
import { MATCH_MANAGEMENT_SECRET, MATCHMAKING_SECRET } from "./env";
import { matchmaking_tests } from "./matches-tests";
import { GameModes, matchmakingURL } from "./gamemodes";
import { createUsers, users } from "../../dummy/dummy-account";

import Fastify from "fastify";
import jwt from "@fastify/jwt";

const app = Fastify();
app.register(jwt, { secret: MATCHMAKING_SECRET });
app.register(jwt, { secret: MATCH_MANAGEMENT_SECRET, namespace: "match_management" });

beforeAll(async () => {
  await app.ready();
});

createUsers(
  matchmaking_tests.reduce((acc, test) => {
    const player_count = test.lobby_player_count.reduce(
      (acc, player_count) => acc + player_count,
      0
    );
    return player_count > acc ? player_count : acc;
  }, 0)
);

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
  it.each(matchmaking_tests)(
    "queue $lobby_player_count.length lobbies and expect $expected_matches.length match(es) ($gamemode)",
    async ({ lobby_player_count, gamemode, expected_matches, expected_tolerances }) => {
      let user_index = 0;
      const lobbies = lobby_player_count.map((player_count, index) => ({
        players: Array.from({ length: player_count }, () => ({ account_id: users[user_index++].account_id })),
        team_names: [],
        mode: GameModes[gamemode],
        join_secret: `${gamemode}_${index}`,
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
        let messagedata;
        await ws.expectJson((message) => {
          expect(message.event).toBe("match");
          expect(message.data.lobbies.length).toBe(expected_match.length);
          for (let lobby of message.data.lobbies) {
            expect(lobby.tolerance).toBe(expected_tolerance);
          }
          messagedata = message.data;
          for (let i of expected_match) {
            expect(
              message.data.lobbies.find((other) => other.join_secret == lobbies[i].join_secret)
            ).toBeDefined();
          }
        });
        const res = await request(matchmakingURL)
        .patch(`/matches/${messagedata.match.match.match_id}`)
        .set("Authorization", `Bearer ${app.jwt.match_management.sign({})}`)
        .send({ state: 2 });
        expect(res.statusCode).toBe(200);
      }
    }
  );
  it("close websocket", async () => {
    await ws.close(1000, "test done");
  });
});

