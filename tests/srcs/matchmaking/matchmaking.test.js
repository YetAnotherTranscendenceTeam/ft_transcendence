import request from "superwstest";
import { MATCH_MANAGEMENT_SECRET, MATCHMAKING_SECRET } from "./env";
import { matchmaking_tests } from "./matches-tests";
import { GameModes, matchmakingURL } from "./gamemodes";
import { createUsers, users } from "../../dummy/dummy-account";

import Fastify from "fastify";
import jwt from "@fastify/jwt";
import { finishMatch } from "./finishmatch";

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
      let messagedata;
      const expectMatchUpdate = async (message, state=1, scores = [0,0]) => {
        expect(message.event).toBe("match_update");
        expect(message.data.match_id).toBeDefined();
        expect(message.data.state).toBe(state);
        expect(message.data.scores[1]).toBe(scores[1]);
        expect(message.data.scores[0]).toBe(scores[0]);
        expect(message.data.tournament_id).toBe(null);
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
          messagedata = message.data;
          expected_match.match = message.data.match.match;
          for (let i of expected_match) {
            expect(
              message.data.lobbies.find((other) => other.join_secret == lobbies[i].join_secret)
            ).toBeDefined();
          }
        });
        messagedata = null;
      }
      for (let match of expected_matches) {
        await finishMatch(app, match.match.match_id, 1);
        ws.expectJson((message) => {
          expect(message.event).toBe("match_update");
          expectMatchUpdate(message, 2, [0, 1]);
        });
      }
    }
  );
  it("close websocket", async () => {
    await ws.close(1000, "test done");
  });
});

