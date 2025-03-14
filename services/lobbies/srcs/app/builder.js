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
import cors from "@fastify/cors";

export default function build(opts = {}) {
	const app = Fastify(opts);
	fetchGameModes().then(() => {
		MatchmakingConnection.instance = new MatchmakingConnection(app);

	});

  if (process.env.ENV !== "production") {
    app.register(cors, {
      origin: true,
      methods: ["GET", "POST", "PATCH", "DELETE"], // Allowed HTTP methods
      credentials: true, // Allow credentials (cookies, authentication)
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
