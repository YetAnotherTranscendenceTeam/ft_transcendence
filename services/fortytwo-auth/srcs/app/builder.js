"use strict";

import Fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import fastifyCookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import JwtGenerator from "yatt-jwt";
import router from "./router.js";
import { AUTH_2FA_SECRET, TOKEN_MANAGER_SECRET } from './env.js';

export default function build(opts = {}) {
  const app = Fastify(opts);

  app.register(jwt, { secret: AUTH_2FA_SECRET, namespace: "auth_2fa" });
  app.register(jwt, { secret: TOKEN_MANAGER_SECRET, namespace: "token_manager" });

  app.decorate("tokens", new JwtGenerator());
  app.addHook('onReady', async function () {
    this.tokens.register(app.jwt.token_manager, "token_manager");
  })

  app.register(fastifyFormbody);
  app.register(fastifyCookie);
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
