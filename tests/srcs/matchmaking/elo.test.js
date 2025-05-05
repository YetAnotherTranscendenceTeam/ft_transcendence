import request from "superwstest";
import { MATCH_MANAGEMENT_SECRET, MATCHMAKING_SECRET } from "./env";
import { GameModes, matchmakingURL } from "./gamemodes";
import { createUsers, users } from "../../dummy/dummy-account";

import Fastify from "fastify";
import jwt from "@fastify/jwt";
import { finishMatch } from "./finishmatch";
import { apiURL } from "../../URLs";

const app = Fastify();
app.register(jwt, { secret: MATCHMAKING_SECRET });
app.register(jwt, { secret: MATCH_MANAGEMENT_SECRET, namespace: "match_management" });

beforeAll(async () => {
  await app.ready();
});

const USER_COUNT = 10;
createUsers(USER_COUNT);

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

let results = new Array(USER_COUNT).fill(null);
const tests = [
  {
    lobbies: [[{ user_index: 0, rating: 260 }], [{ user_index: 1, rating: 140 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 2, rating: 140 }], [{ user_index: 3, rating: 260 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 0, rating: 315.5 }], [{ user_index: 3, rating: 204.5 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 4, rating: 260 }], [{ user_index: 5, rating: 140 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 1, rating: 195.5 }], [{ user_index: 5, rating: 84.5 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 1, rating: 250.631 }], [{ user_index: 3, rating: 149.369 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 2, rating: 200.1798155 }], [{ user_index: 3, rating: 98.94807349999999 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 1, rating: 208.0519265 }], [{ user_index: 4, rating: 310.8201845 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 0, rating: 364.3519646855 }], [{ user_index: 4, rating: 261.9682198145 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 1, rating: 163.076268542 }], [{ user_index: 2, rating: 254.793114449 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 2, rating: 304.29589604446176 }], [{ user_index: 4, rating: 212.46543821903825 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 3, rating: 51.48670171699999 }], [{ user_index: 5, rating: 142.1316657365 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 4, rating: 249.75350257224179 }], [{ user_index: 6, rating: 146.73133663828065 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 1, rating: 120.05985402449473 }], [{ user_index: 6, rating: 210.39563012418847 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 1, rating: 93.61518210296029 }], [{ user_index: 5, rating: 179.3946125350258 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 5, rating: 149.1129971837293 }], [{ user_index: 6, rating: 247.1661630507628 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 4, rating: 286.38027548374265 }], [{ user_index: 6, rating: 201.74896464050175 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 6, rating: 243.0878560063921 }], [{ user_index: 7, rating: 140.94444090587095 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 5, rating: 183.85610943995212 }], [{ user_index: 7, rating: 89.52463476666121 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 1, rating: 64.06595671119958 }], [{ user_index: 7, rating: 142.4021959940225 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 1, rating: 37.348837632452465 }], [{ user_index: 3, rating: 93.23220027754235 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 2, rating: 339.5237914725099 }], [{ user_index: 4, rating: 258.70121479027625 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 4, rating: 283.19638826220995 }], [{ user_index: 6, rating: 210.857364595953 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 5, rating: 158.8754822212844 }], [{ user_index: 6, rating: 235.83799181462072 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 5, rating: 126.15008430399172 }], [{ user_index: 7, rating: 195.7962662801316 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 7, rating: 239.38527762624184 }], [{ user_index: 8, rating: 137.72998379127108 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 6, rating: 208.24787062530154 }], [{ user_index: 7, rating: 275.6880686648197 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 4, rating: 305.5745912291737 }], [{ user_index: 7, rating: 244.9180395852446 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 6, rating: 182.4663305702364 }], [{ user_index: 9, rating: 264.4538501376628 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 5, rating: 104.65134259324407 }], [{ user_index: 8, rating: 187.44582399737504 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 6, rating: 163.84023166669925 }], [{ user_index: 8, rating: 236.1602365143184 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 7, rating: 271.171663097552 }], [{ user_index: 8, rating: 193.32537709950103 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 7, rating: 293.720615498216 }], [{ user_index: 9, rating: 212.30939771112747 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 3, rating: 129.62368554530576 }], [{ user_index: 5, rating: 83.14728311683842 }]],
    winner: 0,
  },
  {
    lobbies: [[{ user_index: 4, rating: 283.99421848839063 }], [{ user_index: 7, rating: 315.300988238999 }]],
    winner: 1,
  },
  {
    lobbies: [[{ user_index: 7, rating: 333.571066675523 }], [{ user_index: 2, rating: 293.84859538119997 }]],
    winner: 0,
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
    await ws.expectJson((message) => {
      expect(message.event).toBe("match_update");
      expect(message.data.match_id).toBe(match.match_id);
      expect(message.data.state).toBe(2);
      expect(message.data.scores[1]).toBe(test.winner);
      expect(message.data.scores[0]).toBe(1 - test.winner);
    });
  });
  it.each(test.lobbies.flat())("check for rating update on player $#", async (player) => {
    const is_winner = test.lobbies[test.winner].includes(player)
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
    expect(matchmaking_user.rating).toBe(player.rating);
    results[player.user_index] = results[player.user_index] || {matches: [], rating: 200, og_index: player.user_index};
    const result = results[player.user_index];
    result.matches.push({
      diff: matchmaking_user.rating - result.rating,
      rating: matchmaking_user.rating,
      match_id: match.match_id,
      winner: is_winner,
      enemy: test.lobbies
        .flat()
        .filter((p) => p.user_index !== player.user_index)
        .map((p) => users[p.user_index].account_id),
      enemy_elo: test.lobbies
        .flat()
        .filter((p) => p.user_index !== player.user_index)
        .map((p) => {
          const enemy_result = results[p.user_index];
          const last_enemy_match = enemy_result?.matches.at(-1);
          if (last_enemy_match) {
            //console.log({enemy_match, match, player, p, enemy_result});
            if (last_enemy_match.match_id === match.match_id)
              return last_enemy_match.rating - last_enemy_match.diff;
            return last_enemy_match.rating;
          }
          return enemy_result?.rating ?? 200;
        }),
    });
    result.rating = matchmaking_user.rating;
  });
});

const diffNumberFormat = new Intl.NumberFormat("en-US", {
  roundingMode: "trunc",
  signDisplay: "always"
});

it("print rating results", () => {
  const eloResults = results.filter((a) => a).sort((a, b) => (b.rating - a.rating)).map((result) => (
      `User ${users[result.og_index].account_id} (i=${result.og_index}) has played ${result.matches.length} matches and finished with ${result.rating} rating: \n  ` +
      result.matches
        .map(
          (result, i) =>
            `#${i} Match ${result.match_id}: ${result.winner ? "W" : "L"} against ${result.enemy.join(', ')} (${Math.trunc(result.enemy_elo.join(', '))} rating) resulting rating: ${result.rating} (${diffNumberFormat.format(result.diff)})`
        )
        .join("\n  ")
  )).join("\n\n");
  console.log(eloResults);
});

it("disconnect from matchmaking websocket", async () => {
  await ws.close();
});
