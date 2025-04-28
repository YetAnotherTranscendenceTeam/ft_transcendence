import request from "superwstest";
import { MATCHMAKING_SECRET } from "./env";
import { GameModes, matchmakingURL } from "./gamemodes";
import { createUsers, users } from "../../dummy/dummy-account";
import { finishMatch } from "./finishmatch";

import { apiURL } from "../../URLs";

import Fastify from "fastify";
import jwt from "@fastify/jwt";

const app = Fastify();
app.register(jwt, { secret: MATCHMAKING_SECRET });

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
	  mode: GameModes["custom_2v2"],
	  join_secret: "custom_2v2_6",
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
		  mode: GameModes["custom_2v2"],
		  join_secret: "custom_2v2_6",
		},
	  },
	});
  });
  it("expect queue failure", async() => {
	await ws.expectJson((message) => {
	  expect(message.event).toBe("confirm_unqueue");
	  expect(message.data.lobby.join_secret).toBe("custom_2v2_6");
	});
  });
  it("finish tournament", async () => {
	await finishMatch(app, tournament.matches[1].match_id, 1);
	const res = await request(apiURL)
	  .get(`/matchmaking/tournaments/${tournament.id}`)
	  .set("Authorization", `Bearer ${users[0].jwt}`);
	tournament = res.body;
	console.log(tournament.matches)
	await finishMatch(app, tournament.matches[0].match_id, 1);
  });
});


it("disconnect from matchmaking websocket", async () => {
  await ws.close();
});
