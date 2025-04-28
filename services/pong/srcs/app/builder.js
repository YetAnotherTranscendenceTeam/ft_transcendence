"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bearerAuth from "@fastify/bearer-auth";
import websocket from '@fastify/websocket'
import formbody from "@fastify/formbody";
import router from "./router.js";
import { AUTHENTICATION_SECRET, MATCH_MANAGEMENT_SECRET, PONG_SECRET } from "./env.js";
import { GameManager } from "../GameManager.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  if (process.env.ENV !== "production") {
    // DEVELOPEMENT configuration
    app.register(cors, {
      origin: true,
      methods: ["GET", "POST", "PATCH", "DELETE"], // Allowed HTTP methods
      credentials: true, // Allow credentials (cookies, authentication)
    });
  } else {
    // PRODUCTION configuration
    // TODO: Setup cors
  }
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


  app.decorate("games", new GameManager());
  app.register(jwt, { secret: AUTHENTICATION_SECRET });
  app.register(jwt, { secret: MATCH_MANAGEMENT_SECRET, namespace: "match_management" });
  app.register(jwt, { secret: PONG_SECRET, namespace: "pong" });

  app.register(formbody);
  app.register(websocket);

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
