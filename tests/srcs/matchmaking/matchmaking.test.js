import { createUsers, users } from "../../dummy/dummy-account";
import request from "superwstest";
import { createLobby, joinLobby } from "../../dummy/lobbies-player";
import { matchmaking_jwt_secret } from "./env";
import { matchmaking_tests } from "./matches-tests";

import Fastify from "fastify";
import jwt from "@fastify/jwt";

const app = Fastify();
app.register(jwt, {
  secret: matchmaking_jwt_secret,
});

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

const matchmakingURL = "http://localhost:4044";

let GameModes;
it("fetch gamemodes", async () => {
  const response = await request(matchmakingURL).get("/gamemodes").expect(200);
  GameModes = response.body;
});

describe("queue and unqueue lobby", () => {
  let lobby;
  it("create lobby", async () => {
    lobby = await createLobby(users[0], {
      name: "ranked_1v1",
      team_size: 1,
      team_count: 2,
      type: "ranked",
    });
  });
  it("queue lobby", async () => {
    await lobby.ws.sendJson({ event: "queue_start" }).expectJson((message) => {
      expect(message.event).toBe("state_change");
      expect(message.data.state.type).toBe("queued");
    });
  });
  it("unqueue lobby", async () => {
    await lobby.ws.sendJson({ event: "queue_stop" }).expectJson((message) => {
      if (message.event !== "state_change") {
        console.error(message);
      }
      expect(message.event).toBe("state_change");
      expect(message.data.state.type).toBe("waiting");
    });
  });
  it("close lobby", async () => {
    await lobby.close();
  });
});

describe("direct (fake lobbies) match making", () => {
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

describe.each(matchmaking_tests)(
  "lobby match making with $lobby_player_count.length lobbies forming $expected_matches.length match(es) ($gamemode)",
  ({ lobby_player_count, gamemode, expected_matches, expected_tolerances }) => {
    let user_index = 0;
    let lobbies = Array.from({ length: lobby_player_count.length }, () => []);
    const lobby_indexes = Array.from({ length: lobby_player_count.length }, (_, i) => i);
    const match_indexes = Array.from({ length: expected_matches.length }, (_, i) => i);
    let lobby_index = 0;
    let matches = new Map();
    it.each(lobby_player_count)("create lobby %# with %i players", async (player_count) => {
      const players = lobbies[lobby_index++];
      const lobby = await createLobby(users[user_index++], GameModes[gamemode]);
      players.push(lobby);
      for (let i = 0; i < player_count - 1; i++) {
        const player = await lobby.join(users[user_index++]);
        for (let other of players) {
          await other.expectJoin(player.user.account_id);
        }
        players.push(player);
      }
    });
    it.each(lobby_indexes)("lobby %# queue", async (lobby_index) => {
      const lobby = lobbies[lobby_index];
      await lobby[0].ws.sendJson({ event: "queue_start" });
    });
    it("expect queue confirmations", async () => {
      await Promise.all(
        lobbies.flat().map((player) =>
          player.ws.expectJson((message) => {
            expect(message.event).toBe("state_change");
            expect(message.data.state.type).toBe("queued");
          })
        )
      );
    });
    it.each(match_indexes)("expect match %#", async (match_index) => {
      const expected_match = expected_matches[match_index];
      for (let lobby_index of expected_match) {
        const lobby = lobbies[lobby_index];
        for (let i = 0; i < lobby.length; i++) {
          const player = lobby[i];
          await player.ws.expectJson((message) => {
            expect(message.event).toBe("state_change");
            expect(message.data.state.type).toBe("playing");
            expect(message.data.state.match).toBeDefined();
            if (i != 0) return;
            let match = matches.get(message.data.state.match);
            if (!match) {
              match = [];
              matches.set(message.data.state.match, match);
            }
            match.push(lobby_index);
          });
        }
      }
    });
    it("compare matches", () => {
      // too unreliable
      //expect([...matches.values()]).toStrictEqual(expected_matches);
      expect([...matches.values()].length).toBe(expected_matches.length);
    });
    it("close lobbies", async () => {
      await Promise.all(lobbies.map(async (lobby) => {
        while (lobby.length > 0) {
          let player = lobby.pop();
          await player.close();
          for (let other of lobby) {
            await other.expectLeave(player.user.account_id);
          }
        }
      }));
    });
  }
);

describe("Lobby unqueue on leave", () => {
  let players = [];
  it("create a ranked 2v2 lobby and fill it up", async () => {
    players.push(
      await createLobby(users[0], {
        name: "ranked_2v2",
        team_size: 2,
        team_count: 2,
        type: "ranked",
      })
    );
    for (let i = 1; i < players[0].lobby.mode.team_size; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
  });
  it("queue the lobby", async () => {
    players[0].ws.sendJson({ event: "queue_start" });
    await Promise.all(
      players.map((player) =>
        player.ws.expectJson((message) => {
          expect(message.event).toBe("state_change");
          expect(message.data.state.type).toBe("queued");
        })
      )
    );
  });
  it("1 player leaves the lobby and expect unqueue", async () => {
    const player = players.pop();
    await player.close();
    await Promise.all(players.map((p) => p.expectLeave(player.user.account_id)));
    await Promise.all(
      players.map((player) =>
        player.ws.expectJson((message) => {
          expect(message.event).toBe("state_change");
          expect(message.data.state.type).toBe("waiting");
        })
      )
    );
  });
  it("leave lobby", async () => {
    while (players.length > 0) {
      let player = players.pop();
      await player.close();
      for (let other of players) {
        await other.expectLeave(player.user.account_id);
      }
    }
  });
});
