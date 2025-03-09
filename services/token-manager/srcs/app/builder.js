"use strict";

import Fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import router from "./router.js";
import YATT, { HttpError } from "yatt-utils";
import cors from "@fastify/cors";
import bearerAuth from "@fastify/bearer-auth";
import { token_manager_secret, jwt_secret } from "./env.js";
import jwt from "@fastify/jwt";

export default function build(opts = {}) {
  const app = Fastify(opts);

  if (process.env.ENV !== "production") {
    // DEVELOPEMENT configuration
    app.register(cors, {
      origin: true,
      methods: ["GET", "POST", "PATCH", "DELETE"], // Allowed HTTP methods
      credentials: true, // Allow credentials (cookies, authentication)
    });

    YATT.setUpSwagger(app, {
      info: {
        title: "Token manager",
        description: "[PLACEHOLDER]",
        version: "1.0.0",
      },
      servers: [
        { url: "http://localhost:4002", description: "Development network" },
        { url: "http://token-manager:3000", description: "Containers network" },
      ],
    });
  } else {
    // PRODUCTION configuration
    // TODO: Setup cors
  }

  const keys = new Set([token_manager_secret]);
  app.register(bearerAuth, {
    keys,
    addHook: false,
    errorResponse: (err) => {
      return new HttpError.Unauthorized().json();
    },
  });

  app.register(jwt, {
    secret: jwt_secret,
  });

  app.register(fastifyFormbody);

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
