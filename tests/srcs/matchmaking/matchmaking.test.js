import request from "superwstest";
import { matchmaking_jwt_secret } from "./env";
import { matchmaking_tests } from "./matches-tests";
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
  it.each(matchmaking_tests)(
    "queue $lobby_player_count.length lobbies and expect $expected_matches.length match(es) ($gamemode)",
    async ({ lobby_player_count, gamemode, expected_matches, expected_tolerances }) => {
      let account_id = 0;
      const lobbies = lobby_player_count.map((player_count, index) => ({
        players: Array.from({ length: player_count }, () => ({ account_id: account_id++ })),
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
        await ws.expectJson((message) => {
          expect(message.event).toBe("match");
          expect(message.data.lobbies.length).toBe(expected_match.length);
          for (let lobby of message.data.lobbies) {
            expect(lobby.tolerance).toBe(expected_tolerance);
          }
          for (let i of expected_match) {
            expect(
              message.data.lobbies.find((other) => other.join_secret == lobbies[i].join_secret)
            ).toBeDefined();
          }
        });
      }
    }
  );
  it("close websocket", async () => {
    await ws.close(1000, "test done");
  });
});

