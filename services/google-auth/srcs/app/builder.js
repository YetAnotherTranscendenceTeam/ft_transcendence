"use strict";

import Fastify from "fastify";
import jwt from '@fastify/jwt';
import JwtGenerator from "yatt-jwt";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import cookie from '@fastify/cookie';
import router from "./router.js";
import { TOKEN_MANAGER_SECRET } from "./env.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  app.register(cors, {
    origin: process.env.CORS_ORIGIN || false,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    maxAge: 600,
  });

  app.register(jwt, { secret: TOKEN_MANAGER_SECRET });
  app.decorate("tokens", new JwtGenerator());
  app.addHook('onReady', async function () {
    this.tokens.register(app.jwt, "token_manager");
  })

  app.register(formbody);
  app.register(cookie);
  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  app.addHook('onClose', (instance) => {
    // Cleanup instructions for a graceful shutdown
  });

  const serverShutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down...`);
    app.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', serverShutdown);
  process.on('SIGTERM', serverShutdown);

  return app;
}
