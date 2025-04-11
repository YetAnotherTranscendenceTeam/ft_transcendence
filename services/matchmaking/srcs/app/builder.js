"use strict";

import Fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import websocket from '@fastify/websocket';
import sse from "yatt-sse"
import router from "./router.js";
import YATT from "yatt-utils";
import jwt from "@fastify/jwt";
import bearerAuth from "@fastify/bearer-auth";
import qs from "qs";
import { jwt_secret } from "./env.js";
import { matchmaking_jwt_secret } from "./env.js";
import db from "./database.js";
import cors from "@fastify/cors";

import { TournamentManger } from "../TournamentManager.js";

export default function build(opts = {}) {
  const app = Fastify({...opts, querystringParser: (str) => qs.parse(str)});

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

  app.register(cors, {
    origin: new RegExp(process.env.CORS_ORIGIN) || true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    maxAge: 600,
  });

  app.register(jwt, {
    secret: jwt_secret,
  });
  app.register(jwt, {
    secret: matchmaking_jwt_secret,
    namespace: "matchmaking"
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

  app.decorate("tournaments", new TournamentManger());
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
