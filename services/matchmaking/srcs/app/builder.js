"use strict";

import Fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import websocket from '@fastify/websocket';
import sse from "yatt-sse"
import router from "./router.js";
import JwtGenerator from "yatt-jwt";
import jwt from "@fastify/jwt";
import { AUTHENTICATION_SECRET, MATCH_MANAGEMENT_SECRET, MATCHMAKING_SECRET, PONG_SECRET } from "./env.js";
import bearerAuth from "@fastify/bearer-auth";
import qs from "qs";
import db from "./database.js";
import cors from "@fastify/cors";

import { TournamentManager } from "../TournamentManager.js";

export default function build(opts = {}) {
  const app = Fastify({...opts, querystringParser: (str) => qs.parse(str)});

  app.register(cors, {
    origin: process.env.CORS_ORIGIN || false,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    maxAge: 600,
  });

  app.register(jwt, { secret: AUTHENTICATION_SECRET });
  app.register(jwt, { secret: MATCHMAKING_SECRET, namespace: "matchmaking" });
  app.register(jwt, { secret: MATCH_MANAGEMENT_SECRET, namespace: "match_management" });
  app.register(jwt, { secret: PONG_SECRET, namespace: "pong" });
  app.decorate("tokens", new JwtGenerator());
  app.addHook('onReady', async function () {
    this.tokens.register(app.jwt.pong, "pong");
  });

  app.register(sse);
  
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

  app.decorate("tournaments", new TournamentManager(app));
  app.register(fastifyFormbody);
  app.register(websocket);

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  app.addHook('onClose', async (instance) => {
    // Cleanup instructions for a graceful shutdown
    await instance.tournaments.cancel();
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
