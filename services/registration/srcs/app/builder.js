"use strict";

import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyFormbody from "@fastify/formbody";
import router from "./router.js";
import YATT from "yatt-utils";
import cors from "@fastify/cors";

export default function build(opts = {}) {
  const app = Fastify(opts);

  app.register(cors, {
    origin: true,
    methods: ['GET', 'POST'], // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authentication)
  });

  if (process.env.ENV !== "production") {
    YATT.setUpSwagger(app, {
      info: {
        title: "Registration",
        description: "[PLACEHOLDER]",
        version: "1.0.0",
      },
      servers: [
        { url: "http://localhost:4012", description: "Development network" },
        { url: "http://credentials:3000", description: "Containers network" },
      ],
    });
  }

  app.register(fastifyCookie);
  app.register(fastifyFormbody);

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
