"use strict";

import Fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import websocket from '@fastify/websocket'
import router from "./router.js";
import YATT, {HttpError} from "yatt-utils";
import bearerAuth from "@fastify/bearer-auth";
import jwt from "@fastify/jwt";
import { jwt_secret } from "./env.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

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

  const serviceAuthorization = (token, request) => {
    if (request.url == "/api-docs") return true;

    try {
      const decoded = app.jwt.verify(token)
      request.account_id = decoded.account_id;
    } catch (err) {
      return false;
    }
    return true;
  };

  app.register(bearerAuth, {
    auth: serviceAuthorization,
    addHook: true,
    errorResponse: (err) => {
      return new HttpError.Unauthorized().json();
    },
  });

  app.register(jwt, {
    secret: jwt_secret,
  });
  app.register(fastifyFormbody);
  app.register(websocket);

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
