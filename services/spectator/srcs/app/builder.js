"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import formbody from "@fastify/formbody";
import router from "./router.js";
import websocket from "@fastify/websocket";
import { AUTHENTICATION_SECRET, PONG_SECRET } from "./env.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  app.register(cors, {
    origin: process.env.CORS_ORIGIN || false,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    maxAge: 600,
  });

  app.register(jwt, { secret: AUTHENTICATION_SECRET, namespace: "authentication" });
  app.register(jwt, { secret: PONG_SECRET, namespace: "pong"  });
  app.register(formbody);
  app.register(websocket);

  app.register(router);

  app.decorate("games", new Map());

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  app.addHook('onClose', (instance) => {
    // Cleanup instructions for a graceful shutdown
  });

  const serverShutdown = (signal) => {
    console.log(`Received . Shutting down...`);
    app.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', serverShutdown);
  process.on('SIGTERM', serverShutdown);

  return app;
}
