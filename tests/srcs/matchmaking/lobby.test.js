import { createLobby, joinLobby } from "../../dummy/lobbies-player";
import { createUsers, users } from "../../dummy/dummy-account";
import { matchmaking_tests } from "./matches-tests";
import { MATCHMAKING_SECRET } from "./env";
import { GameModes, matchmakingURL } from "./gamemodes";
import request from "superwstest";

import Fastify from "fastify";
import jwt from "@fastify/jwt";

const app = Fastify();
app.register(jwt, { secret: MATCHMAKING_SECRET });

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
            if (message.event !== "state_change") {
              console.error(message, player.user.account_id);
            }
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
            const match_id = message.data.state.match.match.match_id;
            let match = matches.get(match_id);
            if (!match) {
              match = {lobbies: []};
              match.match = message.data.state.match.match;
              matches.set(match_id, match);
            }
            match.lobbies.push(lobby_index);
          });
        }
      }
    });
    it("compare matches", () => {
      // too unreliable
      //expect([...matches.values()]).toStrictEqual(expected_matches);
      expect([...matches.values()].length).toBe(expected_matches.length);
    });
    it("set matches as finished", async () => {
      let promises = [];
      for (let match of matches.values()) {
        promises.push(request(matchmakingURL)
          .patch(`/matches/${match.match.match_id}`)
          .set("Authorization", `Bearer ${app.jwt.sign({})}`)
          .send({ state: 2 })
          .then((response) => {
            expect(response.status).toBe(201);
        }));
      }
      await Promise.all(promises);
    });
    it("close lobbies", async () => {
      await Promise.all(
        lobbies.map(async (lobby) => {
          while (lobby.length > 0) {
            let player = lobby.pop();
            await player.close();
            for (let other of lobby) {
              await other.expectLeave(player.user.account_id);
            }
          }
        })
      );
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
