import request from "superwstest";
import { MATCHMAKING_SECRET } from "./env";
import { GameModes, matchmakingURL } from "./gamemodes";
import { createUsers, users } from "../../dummy/dummy-account";

import Fastify from "fastify";
import jwt from "@fastify/jwt";
import { finishMatch } from "./finishmatch";
import { apiURL } from "../../URLs";

const app = Fastify();
app.register(jwt, { secret: MATCHMAKING_SECRET });

beforeAll(async () => {
  await app.ready();
});

createUsers(7);

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

const tests = [
  {
    lobbies: [[{ user_index: 0, elo: 290 }], [{ user_index: 1, elo: 110 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 2, elo: 110 }], [{ user_index: 3, elo: 290 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 0, elo: 371 }], [{ user_index: 3, elo: 209 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 4, elo: 290 }], [{ user_index: 5, elo: 110 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 1, elo: 191 }], [{ user_index: 5, elo: 29 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 1, elo: 266.24 }], [{ user_index: 6, elo: 105.75916230366492 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 1, elo: 334.4016551724138 }], [{ user_index: 4, elo: 201.77133413461542 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 3, elo: 134.42052584159228 }], [{ user_index: 4, elo: 276.2615922317814 }]],
    winner: 1,
  }
];
describe.each(tests)("#$# match $lobbies.length lobbies, team $winner wins", (test) => {
  let match;
  const gamemode_name = test.gamemode || "ranked_1v1";
  it("queue for match", async () => {
    for (let lobby of test.lobbies) {
      await ws
        .sendJson({
          event: "queue_lobby",
          data: {
            lobby: {
              team_names: [],
              players: lobby.map((player) => ({
                account_id: users[player.user_index].account_id,
                profile: users[player.user_index].profile,
              })),
              mode: GameModes[gamemode_name],
              join_secret: gamemode_name + lobby.map((p) => p.user_index).join("_"),
            },
            gamemode: gamemode_name,
          },
        })
        .expectJson((message) => {
          expect(message.event).toBe("confirm_queue");
        });
    }
  });
  it("receive match", async () => {
    await ws.expectJson((message) => {
      expect(message.event).toBe("match");
      expect(message.data.lobbies.length).toBe(2);
      match = message.data.match.match;
    });
  });
  it("finish match", async () => {
    await finishMatch(app, match.match_id, test.winner);
  });
  it.each(test.lobbies.flat())("check for elo update on player $#", async (player) => {
   const user = users[player.user_index];
   const res = await request(apiURL)
     .get(`/matchmaking/users/${user.account_id}`)
     .set("Authorization", `Bearer ${app.jwt.sign({})}`);
   expect(res.status).toBe(200);
   expect(res.body.last_match.match_id).toBe(match.match_id);
   const matchmaking_user = res.body.matchmaking_users.find(
     (user) => user.gamemode === gamemode_name
   );
   expect(matchmaking_user).toBeDefined();
   expect(matchmaking_user.elo).toBe(player.elo);
  });
});

it("disconnect from matchmaking websocket", async () => {
  await ws.close();
});
