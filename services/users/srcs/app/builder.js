"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bearerAuth from "@fastify/bearer-auth";
import formbody from "@fastify/formbody";
import router from "./router.js";
import YATT, { HttpError } from "yatt-utils";
import { jwt_secret } from "./env.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  if (process.env.ENV !== "production") {
    // DEVELOPEMENT configuration
    app.register(cors, {
      origin: true,
      methods: ["GET", "POST", "PATH", "DELETE"], // Allowed HTTP methods
      credentials: true, // Allow credentials (cookies, authentication)
    });

    YATT.setUpSwagger(app, {
      info: {
        title: "Users",
        description: "Serves public data about users",
        version: "1.0.0",
      },
      servers: [
        { url: "http://localhost:4003", description: "Development network" },
        { url: "http://users:3000", description: "Containers network" },
      ],
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
      console.log("DANS LE truc qui auth: ", decoded.account_id);
      console.log('sdfsdfsd:', request.account_id);
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

  app.register(jwt, { secret: jwt_secret });

  app.register(formbody);

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
