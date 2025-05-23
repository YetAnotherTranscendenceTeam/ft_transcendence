import request from "superwstest";
import { MATCH_MANAGEMENT_SECRET, MATCHMAKING_SECRET, PONG_SECRET } from "./env";
import { GameModes, matchmakingURL } from "./gamemodes";
import { createUsers, users } from "../../dummy/dummy-account";
import { finishMatch } from "./finishmatch";

import { apiURL } from "../../URLs";

import Fastify from "fastify";
import jwt from "@fastify/jwt";

const app = Fastify();
app.register(jwt, { secret: MATCHMAKING_SECRET });
app.register(jwt, { secret: MATCH_MANAGEMENT_SECRET, namespace: "match_management" });
app.register(jwt, { secret: PONG_SECRET, namespace: "pong" });

beforeAll(async () => {
  await app.ready();
});

createUsers(6);

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

describe("already in a tournament and queue for another", () => {
  let tournament;
  test("create tournament", async () => {
	const lobby = {
	  team_names: [],
	  players: Array.from({ length: 6 }, (_, index) => ({
		account_id: users[index].account_id,
		profile: users[index].profile,
	  })),
	  mode: GameModes["tournament_2v2"],
	  join_secret: "tournament_2v2_6",
	};

	await ws
	  .sendJson({
		event: "queue_lobby",
		data: { lobby },
	  })
	  .expectJson((message) => {
		expect(message.event).toBe("confirm_queue");
		expect(message.data.queue_stats.players).toBe(6);
		expect(message.data.queue_stats.lobbies).toBe(1);
	  })
	  .expectJson((message) => {
		expect(message.event).toBe("match");
		expect(message.data.match.tournament).toBeDefined();
		expect(message.data.match.tournament.id).toBeDefined();
		expect(message.data.match.tournament.teams.length).toBe(3);
		tournament = message.data.match.tournament;
	  });
  });
  it("try to queue for another match", async () => {
	await ws.sendJson({
	  event: "queue_lobby",
	  data: {
		lobby: {
		  team_names: [],
		  players: Array.from({ length: 6 }, (_, index) => ({
			account_id: users[index].account_id,
			profile: users[index].profile,
		  })),
		  mode: GameModes["tournament_2v2"],
		  join_secret: "tournament_2v2_6",
		},
	  },
	});
  });
  it("expect queue failure", async() => {
	await ws.expectJson((message) => {
	  expect(message.event).toBe("confirm_unqueue");
	  expect(message.data.lobby.join_secret).toBe("tournament_2v2_6");
	});
  });
  it("finish tournament", async () => {
	await finishMatch(app, tournament.matches[1].match_id, 1);
	await ws.expectJson((message) => {
		expect(message.event).toBe("match_update");
		expect(message.data.match_id).toBe(tournament.matches[1].match_id);
		expect(message.data.state).toBe(2);
		expect(message.data.tournament_id).toBe(tournament.id);
	});
	await ws.expectJson((message) => {
		expect(message.event).toBe("tournament_update");
		expect(message.data.tournament_id).toBe(tournament.id);
		expect(message.data.stage).toBe(0);
		expect(message.data.team_count).toBe(3);
		expect(message.data.players.length).toBe(6);
	});
	const res = await request(apiURL)
	  .get(`/matchmaking/tournaments/${tournament.id}`)
	  .set("Authorization", `Bearer ${users[0].jwt}`);
	tournament = res.body;
	await finishMatch(app, tournament.matches[0].match_id, 1);
	await ws.expectJson((message) => {
		expect(message.event).toBe("match_update");
		expect(message.data.match_id).toBe(tournament.matches[0].match_id);
		expect(message.data.state).toBe(2);
		expect(message.data.tournament_id).toBe(tournament.id);
	});
	await ws.expectJson((message) => {
		expect(message.event).toBe("tournament_update");
		expect(message.data.tournament_id).toBe(tournament.id);
		expect(message.data.stage).toBeUndefined();
		expect(message.data.team_count).toBe(3);
		expect(message.data.players.length).toBe(6);
	});
  });
});


it("disconnect from matchmaking websocket", async () => {
  await ws.close();
});
