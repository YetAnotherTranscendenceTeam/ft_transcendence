"use strict";

const jwt_secret = process.env.JWT_SECRET;
if (!jwt_secret) {
  console.error("Missing environment variable: JWT_SECRET");
  process.exit(1);
}

import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyJWT from "@fastify/jwt";
import fastifyFormbody from "@fastify/formbody";
import routes from "./routes.js";
import YATT from "yatt-utils";
import cors from "@fastify/cors";

export default function build(opts = {}) {
  const app = Fastify(opts);

  if (process.env.ENVIRONEMENT !== "production") {
    // Dev only settings
    app.register(cors, {
      origin: true,
      methods: ["GET", "POST"], // Allowed HTTP methods
      credentials: true, // Allow credentials (cookies, authentication)
    });

    YATT.setUpSwagger(app, {
      info: {
        title: "Password Auth Service",
        description: "Service for password-based authentication",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:4022",
          description: "Password Auth (Public)",
        },
      ],
    });

    app.get("/swagger.json", async (_, reply) => {
      return reply.send(app.swagger());
    });
  } else {
    //SETUP CORS FOR PRODUCTION
  }

  app.register(fastifyCookie, {
    secret: "my-secret", // Optional: for signing cookies
  });

  app.register(fastifyJWT, {
    secret: jwt_secret,
  });

  app.register(fastifyFormbody);

  app.register(routes);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
