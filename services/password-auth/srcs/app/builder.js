"use strict";

import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyFormbody from "@fastify/formbody";
import router from "./router.js";
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
  } else {
    //SETUP CORS FOR PRODUCTION
  }

  app.register(fastifyCookie);

  app.register(fastifyFormbody);

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
