import request from "superwstest";
import { matchmaking_jwt_secret } from "./env";
import { GameModes, matchmakingURL } from "./gamemodes";
import { apiURL } from "../../URLs.js"
import { createUsers, users } from "../../dummy/dummy-account";
import { createEventSource } from 'eventsource-client'

import { Agent } from "undici"

import Fastify from "fastify";
import jwt from "@fastify/jwt";

const app = Fastify();
app.register(jwt, {
  secret: matchmaking_jwt_secret,
});

beforeAll(async () => {
  await app.ready();
});

createUsers(32);

function finishMatch(match_id, winner) {
  return request(matchmakingURL)
    .patch(`/matches/${match_id}`)
    .set("Authorization", `Bearer ${app.jwt.sign({})}`)
    .send({
      state: 2,
      score_0: winner === 0 ? 1 : 0,
      score_1: winner === 1 ? 1 : 0,
    }).expect(200);
}

function createTestSSE(url) {
  return new Promise((resolve, reject) => {
    const messages = [];
    let closeCallback;

    const object = {
      messages,
      sse: createEventSource({
        url,
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            dispatcher: new Agent({
              connect: {
                rejectUnauthorized: false,
              },
            }),
          }).catch((error) => {
            reject(error);
            throw error;
          })
        },
        onConnect: () => {
          resolve(object);
        },
        onMessage: (message) => {
          messages.push(message);
        },
        onDisconnect() {
          expect(messages.length).toBe(0);
          if (closeCallback)
            closeCallback();
          closeCallback = null;
        }
      }),
      close() {
        return this.sse.close();
      },
      expectJson(eventName, callback) {
        return new Promise(async (resolve) => {
          let event = this.messages.shift();
          if (!event) {
            for await (event of this.sse)
              break;
            this.messages.shift();
          }
          expect(event.event).toBe(eventName);
          const data = JSON.parse(event.data);
          if (callback)
            await callback(data);
          resolve(data);
        });
      },
      expectClose() {
        return new Promise((resolve) => {
          closeCallback = resolve;
        });
      }
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

describe.each(
  Array.from(
    { length: 14 },
    (_, index) => ({
      player_count: index + 3,
      gamemode: "custom_1v1",
      team_size: 1
    })
  ).concat(
    Array.from(
      { length: 28 },
      (_, index) => ({
        player_count: index + 5,
        gamemode: "custom_2v2",
        team_size: 2
      })
    )
  ))
("$gamemode with $player_count players", ({player_count, gamemode, team_size}) => {
  let team_count = Math.ceil(player_count / team_size);
  let tournament;
  let sse;
  it("create lobby and queue for tournament", async () => {
    const lobby = {
      team_names: [],
      players: Array.from({ length: player_count }, (_, index) => ({
        account_id: users[index].account_id
      })),
      mode: GameModes[gamemode],
      join_secret: `${gamemode}_${player_count}`,
    };
    
    await ws
      .sendJson({
        event: "queue_lobby",
        data: { lobby },
      })
      .expectJson((message) => {
        expect(message.event).toBe("confirm_queue");
        expect(message.data.queue_stats.players).toBe(player_count);
        expect(message.data.queue_stats.lobbies).toBe(1);
      })
  })
  it("expect tournament start", async () => {
    await ws.expectJson((message) => {
      expect(message.event).toBe("match");
      expect(message.data.match.tournament).toBeDefined();
      expect(message.data.match.tournament.id).toBeDefined();
      expect(message.data.match.tournament.teams.length).toBe(team_count);
      
      tournament = message.data.match.tournament;
    });
  });
  it("connect to SSE and expect tournament sync", async () => {
    sse = await createTestSSE(`${apiURL}/matchmaking/tournaments/${tournament.id}/notify?token=${users[0].jwt}`,);
    await sse.expectJson("sync", (event) => {
      const event_tournament = event.tournament;
      expect(event_tournament).toBeDefined();
      expect(event_tournament.teams).toBeDefined();
      expect(event_tournament.matches).toBeDefined();
      expect(event_tournament.matches.length).toBeGreaterThanOrEqual(Math.ceil(Math.log2(team_count)));
      expect(event_tournament.gamemode).toBeDefined();
      expect(event_tournament.id).toBeDefined();
      expect(tournament.teams.length).toBe(team_count);
    });
  });
  const stages = [];
  it("build tournament stages", () => {
    for (let match of tournament.matches) {
      if (stages[match.stage])
        stages[match.stage].push(match);
      else
        stages[match.stage] = [match];
    }
    stages.reverse();
  });
  it.each(Array.from({ length: Math.ceil(Math.log2(team_count)) }, (_, index) => index))
    ("complete tournament stage %i", async (stageIndex) => {
      const stage = stages[stageIndex];
      for (let matchIndex = 0; matchIndex < stage.length; matchIndex++) {
        const winnerIndex = 0;
        const loserIndex = 1;
        const match = stage[matchIndex];

        expect(match.state).toBe("playing");
        expect(match.match_id).toBeDefined();
        expect(match.team_ids.length).toBe(2);
        await finishMatch(match.match_id, winnerIndex);
        await sse.expectJson("match_update", (event) => {
          expect(event.match.match_id).toBe(match.match_id);
          expect(event.match.index).toBe(match.index);
          expect(event.match.state).toBe("done");
          expect(event.match.scores[winnerIndex]).toBe(1);
          expect(event.match.scores[loserIndex]).toBe(0);

          match.state = event.match.state;
          match.scores = event.match.scores;
          match.team_ids = event.match.team_ids;
          match.match_id = event.match.match_id;
        });
        if (match.stage == 0) {
          break;
        }
        const next_stage_match = stages[stageIndex + 1][Math.floor(matchIndex / 2)];
        const next_event_start = matchIndex % 2 == 1 || next_stage_match.team_ids.length == 1;
        await sse.expectJson("match_update", (event) => {
          expect(event.match.index).toBe(next_stage_match.index);
          if (next_event_start) {
            expect(event.match.match_id).toBeDefined();
            expect(event.match.state).toBe("playing");
            expect(event.match.team_ids.length).toBe(2);
            expect(event.match.team_ids[1]).toBe(match.team_ids[winnerIndex]);
          }
          else {
            expect(event.match.match_id).toBeUndefined();
            expect(event.match.state).toBe("waiting");
            expect(event.match.team_ids.length).toBe(1);
            expect(event.match.team_ids[0]).toBe(match.team_ids[winnerIndex]);
          }

          const match_update = tournament.matches[event.match.index];
          match_update.match_id = event.match.match_id;
          match_update.state = event.match.state;
          match_update.team_ids = event.match.team_ids;
          match_update.scores = event.match.scores;
        });
      }
  });
  it("expect tournament finished", async () => {
    await sse.expectJson("finish", async () => {
      await sse.expectClose();
    });
  });
});

it("close matchmaking websocket", async () => {
  await ws.close();
});
