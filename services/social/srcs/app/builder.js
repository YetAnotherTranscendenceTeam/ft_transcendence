"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bearerAuth from "@fastify/bearer-auth";
import formbody from "@fastify/formbody";
import websocket from '@fastify/websocket'
import router from "./router.js";
import { HttpError } from "yatt-utils";
import { jwt_secret } from "./env.js";
import { ConnectionManager } from "../utils/ConnectionManager.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  if (process.env.ENV !== "production") {
    // DEVELOPEMENT configuration
    app.register(cors, {
      origin: true,
      methods: ["GET", "POST", "DELETE"], // Allowed HTTP methods
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

  app.register(jwt, { secret: jwt_secret });
  app.register(formbody);
  app.register(websocket);

  app.register(router);

  // Create and attach the websocket manager
  app.decorate('clients', new ConnectionManager());

  // Close every websocket on server exit
  app.addHook('onClose', (instance) => {
    instance.clients.cleanup();
  });

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
