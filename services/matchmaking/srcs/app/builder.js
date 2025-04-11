"use strict";

import Fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import websocket from '@fastify/websocket'
import router from "./router.js";
import YATT from "yatt-utils";
import jwt from "@fastify/jwt";
import { AUTHENTICATION_SECRET } from "./env.js";
import { matchmaking_jwt_secret } from "./env.js";
import db from "./database.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  if (process.env.ENV !== "production") {
    YATT.setUpSwagger(app, {
      info: {
        title: "Matching",
        description: "Service for matching game lobbies",
        version: "1.0.0",
      },
      servers: [
        { url: "http://localhost:4044", description: "Development network" },
        { url: "http://matchmaking:3000", description: "Containers network" },
      ],
    });
  }
  app.register(jwt, {
    secret: AUTHENTICATION_SECRET,
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

  app.addHook('onClose', (instance) => {
    // Cleanup instructions for a graceful shutdown
    db.close();
  });

  const serverShutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down...`);
    app.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', serverShutdown);
  process.on('SIGTERM', serverShutdown);

  return app;
}
