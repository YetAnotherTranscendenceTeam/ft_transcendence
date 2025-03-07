import { users } from "../../dummy/dummy-account";
import request from "superwstest";
import { createLobby } from "../../dummy/lobbies-player";
import { jwt_matchmaking_secret } from "./env";

import Fastify from "fastify";
import jwt from "@fastify/jwt"

const app = Fastify();
app.register(jwt, {
  secret: process.env.jwt_matchmaking_secret
})

const matchmakingURL = "ws://localhost:3000/matchmaking";

describe("queue and unqueue lobby", () => {
  let lobby;
  test("create lobby", async () => {
    lobby = await createLobby(users[0], { name: "ranked_1v1", team_size: 1, team_count: 1, ranked: true })
  });
  test("queue lobby", async () => {
    await lobby.ws.sendJson({ event: "queue_start" }).expectJson((message) => {
      expect(message.event).toBe("state_change");
      expect(message.data.state.type).toBe("queued");
    });
  });
  test("unqueue lobby", async () => {
    await lobby.ws.wait(50).sendJson({ event: "queue_stop" }).expectJson((message) => {
      if (message.event !== "state_change") {
        console.error(message)
      }
      expect(message.event).toBe("state_change");
      expect(message.data.state.type).toBe("waiting");
    });
  });
  test("close lobby", async () => {
    await lobby.close();
  });
});

describe("match making test", () => {
  let lobbies = [];
  let ws;
  let GameModes;
  test("fetch gamemodes", async () => {
    const response = await request(matchmakingURL).get("/gamemodes").expect(200);
    GameModes = response.body;
  })
  test("create lobbies", async () => {
    ws = request(matchmakingURL).ws("/lobbieconnection").sendJson({
      event: "handshake",
      data: {
        jwt: app.jwt.sign({ GameModes })
      }
    }).expectJson((message) => {
      expect(message.event).toBe("handshake");
    });
  })
})

