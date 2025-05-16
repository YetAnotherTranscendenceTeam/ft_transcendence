import request from "superwstest";
import { MATCH_MANAGEMENT_SECRET, MATCHMAKING_SECRET, PONG_SECRET } from "./env";
import { GameModes, matchmakingURL } from "./gamemodes";
import { createUsers, users } from "../../dummy/dummy-account";

import Fastify from "fastify";
import jwt from "@fastify/jwt";
import { finishMatch } from "./finishmatch";
import { apiURL } from "../../URLs";

const app = Fastify();
app.register(jwt, { secret: MATCHMAKING_SECRET });
app.register(jwt, { secret: MATCH_MANAGEMENT_SECRET, namespace: "match_management" });
app.register(jwt, { secret: PONG_SECRET, namespace: "pong" });

beforeAll(async () => {
  await app.ready();
});

const USER_COUNT = 32;
let results = new Array(USER_COUNT).fill(null);
createUsers(USER_COUNT);

function getTestLobbies() {
  let closest_rating = 999999999;
  let closest_lobbies = [];

  for (let i = 0; i < USER_COUNT; i++) {
    const rating = results[i]?.rating || 200;
    for (let j = i + 1; j < USER_COUNT; j++) {
      const rating2 = results[j]?.rating || 200;
      const diff = Math.abs(rating - rating2);
      if (diff < closest_rating) {
        closest_rating = diff;
        closest_lobbies = [[{ user_index: i, rating }], [{ user_index: j, rating: rating2 }]];
      }
    }
  }
  return closest_lobbies.map((lobby) => {
    return {
      team_names: [],
      players: lobby.map((player) => ({
        account_id: users[player.user_index].account_id,
        profile: users[player.user_index].profile,
        user_index: player.user_index,
      })),
      mode: GameModes["ranked_1v1"],
      join_secret: "ranked_1v1" + lobby.map((p) => p.user_index).join("_"),
    };
  });
}

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

const MATCH_COUNT = 64;
describe.each(new Array(MATCH_COUNT).fill(null).map((_, i) => i))(
  `Create math data for match %d`,
  () => {
    let match;
    const gamemode_name = "ranked_1v1";
    let lobbies;
    it("queue for match", async () => {
      lobbies = getTestLobbies();
      for (let lobby of lobbies) {
        await ws
          .sendJson({
            event: "queue_lobby",
            data: { lobby },
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
    const winner = 1;
    it("finish match", async () => {
      await finishMatch(app, match.match_id, winner);
      await ws.expectJson((message) => {
        expect(message.event).toBe("match_update");
        expect(message.data.match_id).toBe(match.match_id);
        expect(message.data.state).toBe(2);
      });
    });
    it.each([0, 1])("check for rating update on player %d", async (player_index) => {
      const is_winner = winner == player_index;
      const user_index = lobbies[player_index].players[0].user_index;
      const user = users[user_index];
      const res = await request(apiURL)
        .get(`/matchmaking/users/${user.account_id}`)
        .set("Authorization", `Bearer ${user.jwt}`);
      expect(res.status).toBe(200);
      expect(res.body.last_match.match_id).toBe(match.match_id);
      const matchmaking_user = res.body.matchmaking_users.find(
        (user) => user.gamemode === gamemode_name
      );
      expect(matchmaking_user).toBeDefined();
      expect(matchmaking_user.rating).toBeDefined();
      results[user_index] = results[user_index] || {
        matches: [],
        rating: 200,
        og_index: user_index,
      };
      const result = results[user_index];
      result.matches.push({
        diff: matchmaking_user.rating - result.rating,
        rating: matchmaking_user.rating,
        match_id: match.match_id,
        winner: is_winner,
        enemy: lobbies
          .map((lobby) => lobby.players)
          .flat()
          .filter((p) => p.user_index !== user_index)
          .map((p) => users[p.user_index].account_id),

        enemy_elo: lobbies
          .map((lobby) => lobby.players)
          .flat()
          .filter((p) => p.user_index !== user_index)
          .map((p) => {
            const enemy_result = results[p.user_index];
            const last_enemy_match = enemy_result?.matches.at(-1);
            if (last_enemy_match) {
              if (last_enemy_match.match_id === match.match_id)
                return last_enemy_match.rating - last_enemy_match.diff;
              return last_enemy_match.rating;
            }
            return enemy_result?.rating ?? 200;
          }),
      });
      result.rating = matchmaking_user.rating;
    });
  }
);

const diffNumberFormat = new Intl.NumberFormat("en-US", {
  roundingMode: "trunc",
  signDisplay: "always",
});

it("print rating results", () => {
  const eloResults = results
    .filter((a) => a)
    .sort((a, b) => b.rating - a.rating)
    .map(
      (result) =>
        `User ${users[result.og_index].account_id} (i=${result.og_index}) has played ${
          result.matches.length
        } matches and finished with ${result.rating} rating: \n  ` +
        result.matches
          .map(
            (result, i) =>
              `#${i} Match ${result.match_id}: ${
                result.winner ? "W" : "L"
              } against ${result.enemy.join(", ")} (${Math.trunc(
                result.enemy_elo.join(", ")
              )} rating) resulting rating: ${result.rating} (${diffNumberFormat.format(
                result.diff
              )})`
          )
          .join("\n  ")
    )
    .join("\n\n");
  console.log(eloResults);
});

describe.each(Array.from({ length: 14 }, (_, i) => i + 3))("elo based tournament match order with %d players", (player_count) => {
  let tournament_lobby;
  let tournament;
  it("create tournament", async () => {
    tournament_lobby = {
      team_names: [],
      players: users.slice(0, player_count).map((user, i) => ({
        account_id: user.account_id,
        profile: user.profile,
        user_index: i,
      })),
      mode: GameModes["tournament_1v1"],
      join_secret: "tournament_1v1",
    };
    await ws
      .sendJson({
        event: "queue_lobby",
        data: {
          lobby: tournament_lobby,
        },
      })
      .expectJson((message) => {
        expect(message.event).toBe("confirm_queue");
      });
  });
  it("receive tournament", async () => {
    await ws.expectJson((message) => {
      expect(message.event).toBe("match");
      expect(message.data.lobbies.length).toBe(1);
      expect(message.data.match.tournament).toBeDefined();
      expect(message.data.match.tournament.id).toBeDefined();
      expect(message.data.match.tournament.teams.length).toBe(player_count);
      tournament = message.data.match.tournament;
      console.log("Tournament id", tournament.id);
      for (let player of tournament.teams.map((team) => team.players).flat()) {
        expect(player.rating).toBe(
          results.find((p) => users[p.og_index].account_id == player.account_id).rating
        );
      }
    });
  });
  const stages = [];
  it("build tournament stages", () => {
    for (let match of tournament.matches) {
      if (stages[match.stage]) stages[match.stage].push(match);
      else stages[match.stage] = [match];
    }
    console.log({
      sorted_teams: tournament.teams
        .toSorted((a, b) => b.players[0].rating - a.players[0].rating)
        .map((team) => team.players[0]),
    });
    stages.reverse();
  });
  it.each(Array.from({ length: Math.ceil(Math.log2(player_count)) }, (_, index) => index))(
    "complete tournament stage %i",
    async (stageIndex) => {
      const sorted_account_ids = tournament.teams
        .toSorted((a, b) => b.players[0].rating - a.players[0].rating)
        .map((team) => team.players[0].account_id);
      const stage = stages[stageIndex];
      const res = await request(apiURL)
        .get(`/matchmaking/tournaments/${tournament.id}`)
        .set("Authorization", `Bearer ${users[0].jwt}`);
      expect(res.status).toBe(200);
      for (let match of stage) {
        const updated_match = res.body.matches.find((m) => m.index === match.index);
        match.match_id = updated_match.match_id;
        match.state = updated_match.state;
        match.team_ids = updated_match.team_ids;
        console.log({match})
        expect(match.state).toBe("playing")
        const teams = match.team_ids.map((id) => tournament.teams[id]);
        const ratings = teams.map((team) => team.players[0].rating);
        console.log({ players: teams.map((team) => team.players[0]), stageIndex, team_ids: match.team_ids });
        const winner = ratings.indexOf(Math.max(...ratings));
        await finishMatch(app, match.match_id, winner);
        await ws.expectJson((message) => {
          expect(message.event).toBe("match_update");
          expect(message.data.match_id).toBe(match.match_id);
          expect(message.data.state).toBe(2);
        });
        await ws.expectJson((message) => {
          expect(message.event).toBe("tournament_update");
          expect(message.data.tournament_id).toBe(tournament.id);
        });
        if (stageIndex === stages.length - 2) {
          expect([0, 1]).toContainEqual(sorted_account_ids.indexOf(teams[winner].players[0].account_id));
          expect([2, 3]).toContainEqual(sorted_account_ids.indexOf(teams[winner == 0 ? 1 : 0].players[0].account_id));
        } else if (stageIndex === stages.length - 1) {
          expect([0, 1]).toContainEqual(sorted_account_ids.indexOf(teams[0].players[0].account_id));
          expect([0, 1]).toContainEqual(sorted_account_ids.indexOf(teams[1].players[0].account_id));
        }
      }
    }
  );
});

it("disconnect from matchmaking websocket", async () => {
  await ws.close();
});
