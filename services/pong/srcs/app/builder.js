"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bearerAuth from "@fastify/bearer-auth";
import websocket from '@fastify/websocket'
import formbody from "@fastify/formbody";
import router from "./router.js";
import { AUTHENTICATION_SECRET, MATCH_MANAGEMENT_SECRET, PONG_SECRET, SPECTATOR_SECRET } from "./env.js";
import { GameManager } from "../GameManager.js";
import JwtGenerator from "yatt-jwt";

export default function build(opts = {}) {
  const app = Fastify(opts);

  app.register(cors, {
    origin: process.env.CORS_ORIGIN || false,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    maxAge: 600,
  });

  const serviceAuthorization = (token, request) => {
    try {
      const decoded = app.jwt.verify(token);
      request.token = token;
      request.account_id = decoded.account_id;
    } catch (err) {
      return false;
    }
    return true;
  };

  app.register(bearerAuth, {
    auth: serviceAuthorization,
    addHook: false,
    errorResponse: (err) => {
      return new HttpError.Unauthorized().json();
    },
  });

  app.decorate("games", new GameManager(app));
  app.register(jwt, { secret: AUTHENTICATION_SECRET });
  app.register(jwt, { secret: MATCH_MANAGEMENT_SECRET, namespace: "match_management" });
  app.register(jwt, { secret: PONG_SECRET, namespace: "pong" });
  app.register(jwt, { secret: SPECTATOR_SECRET, namespace: "spectator" });
  app.decorate("tokens", new JwtGenerator());
  app.addHook('onReady', async function () {
    this.tokens.register(app.jwt.match_management, "match_management");
  });

  app.register(formbody);
  app.register(websocket);

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  app.addHook('onClose', async (instance) => {
    // Cleanup instructions for a graceful shutdown
    await instance.games.cancel();
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
