"use strict";

import Fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import websocket from '@fastify/websocket'
import router from "./router.js";
import YATT, {HttpError} from "yatt-utils";
import jwt from "@fastify/jwt";
import { jwt_secret, matchmaking_jwt_secret } from "./env.js";
import { fetchGameModes, GameModes } from "../GameModes.js";
import MatchmakingConnection from "../MatchmakingConnection.js";

export default function build(opts = {}) {
	const app = Fastify(opts);
	fetchGameModes().then(() => {
		MatchmakingConnection.instance = new MatchmakingConnection(app);

	});

  if (process.env.ENV !== "production") {
    YATT.setUpSwagger(app, {
      info: {
        title: "Lobbies",
        description: "Service for managing game lobbies",
        version: "1.0.0",
      },
      servers: [
        { url: "http://localhost:4043", description: "Development network" },
        { url: "http://lobbies:3000", description: "Containers network" },
      ],
    });
  }
  app.register(jwt, {
    secret: jwt_secret,
  });
  app.register(jwt, {
	secret: matchmaking_jwt_secret,
	namespace: "matchmaking"
  })
  app.register(fastifyFormbody);
  app.register(websocket);

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
