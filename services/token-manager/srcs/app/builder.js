"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import jwt from "@fastify/jwt";
import bearerAuth from "@fastify/bearer-auth";
import cookie from "@fastify/cookie";
import router from "./router.js";
import YATT, { HttpError } from "yatt-utils";
import { token_manager_secret, jwt_secret, refresh_token_secret } from "./env.js";

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

  app.register(jwt, {
    secret: refresh_token_secret,
    namespace: "refresh"
  })

  app.register(cookie)
  app.register(formbody);

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
