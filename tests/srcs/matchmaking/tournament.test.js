import request from "superwstest";
import { matchmaking_jwt_secret } from "./env";
import { GameModes, matchmakingURL } from "./gamemodes";
import { createUsers, users } from "../../dummy/dummy-account";
import {createEventSource} from 'eventsource-client'

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

function expectSSEEvent(sse, eventName, callback) {
  return new Promise(async (resolve, reject) => {
    const event = (await sse[Symbol.asyncIterator]().next()).value;
    expect(event.event).toBe(eventName);
    if (callback) {
      await callback(JSON.parse(event.data));
    }
    resolve(event);
  });
}

describe("direct matchmaking", () => {
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
  it.each(Array.from({ length: 10 }, (_, index) => index + 3))
  ("queue %d players in a 1v1 custom lobby", async (player_count) => {
    const lobby = {
      team_names: [],
      players: Array.from({ length: player_count }, (_, index) => ({ account_id: users[index].account_id })),
      mode: GameModes["custom_1v1"],
      join_secret: `custom_1v1_${player_count}`,
    };
    let tournament;
    let sse;
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
      .expectJson((message) => {
        expect(message.event).toBe("match");
        tournament = message.data.match.tournament;
        expect(tournament).toBeDefined();
        expect(tournament.id).toBeDefined();
        expect(tournament.teams.length).toBe(player_count);
        sse = createEventSource(
          `${matchmakingURL}/tournaments/${tournament.id}/notify?token=${users[0].jwt}`
        );
      });
    await expectSSEEvent(sse, "sync", (event) => {
      expect(event).toBeDefined();
      expect(event.teams).toBeDefined();
      expect(event.matches).toBeDefined();
      expect(event.matches.length).toBeLessThanOrEqual(Math.ceil(Math.log2(player_count)));
      expect(event.gamemode).toBeDefined();
      expect(event.id).toBeDefined();
      expect(event.teams.length).toBe(player_count);
    });
    for (let match of tournament.matches.filter((match) => match.match_id)) {
      await finishMatch(match.match_id, 1);
      await expectSSEEvent(sse, "match_update", (event) => {
        console.log(event);
        expect(event.match).toBeDefined();
        expect(event.match.match_id).toBe(match.match_id);
        expect(event.match.state).toBe('done');
        expect(event.match.scores[0]).toBe(0);
        expect(event.match.scores[1]).toBe(1);
      });
      if (match.match_id === tournament.matches[0].match_id) {
        await expectSSEEvent(sse, "finish", (event) => {
          console.log(event);
          expect(event.match).toBeDefined();
          expect(event.match.state).toBe('playing');
          expect(event.match.scores[0]).toBe(0);
          expect(event.match.scores[1]).toBe(0);
        });
        return;
      }
      await expectSSEEvent(sse, "match_update", (event) => {
        console.log(event);
        expect(event.match).toBeDefined();
        expect(event.match.state).toBe('playing');
        expect(event.match.scores[0]).toBe(0);
        expect(event.match.scores[1]).toBe(0);
      });
    }
    sse.close();
  })
  it("close matchmaking websocket", async () => {
    await ws.close();
  });
});
