"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bearerAuth from "@fastify/bearer-auth";
import formbody from "@fastify/formbody";
import router from "./router.js";
import YATT from "yatt-utils";

export default function build(opts = {}) {
  const app = Fastify(opts);

  const routeWhitelist = ["/ping"];

  if (process.env.ENV !== "production") {
    // DEVELOPEMENT configuration
    app.register(cors, {
      origin: true,
      methods: ["GET", "POST", "PATH", "DELETE"], // Allowed HTTP methods
      credentials: true, // Allow credentials (cookies, authentication)
    });

    YATT.setUpSwagger(app, {
      info: {
        title: "[PLACEHOLDER]",
        description: "[PLACEHOLDER]",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:[PLACEHOLDER]",
          description: "Development network",
        },
        { url: "http://${SERVICE}:3000", description: "Containers network" },
      ],
    });

    routeWhitelist.push("/api-docs");
    routeWhitelist.push("/api-docs/json"); 
    
  } else {
    // PRODUCTION configuration
    // TODO: Setup cors
  }

  const serviceAuthorization = (token, request) => {
    if (routeWhitelist.includes(request.url)) {
      return true;
    }

    try {
      const decoded = app.jwt.verify(token);
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

  app.register(jwt, { secret: jwt_secret });

  app.register(formbody);

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
