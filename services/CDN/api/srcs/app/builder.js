"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bearerAuth from "@fastify/bearer-auth";
import formbody from "@fastify/formbody";
import router from "./router.js";
import { cdn_jwt_secret } from "./env.js";
import { HttpError } from "yatt-utils";

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

  app.register(jwt, { secret: cdn_jwt_secret });
  app.register(formbody);
  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
