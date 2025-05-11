"use strict";

import Fastify from "fastify";
import formbody from "@fastify/formbody";
import jwt from "@fastify/jwt";
import router from "./router.js";
import { CDN_SECRET, CDN_URL } from "./env.js";
import { UsernameBank } from "../utils/UsernameBank.js";
import db from "./database.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  app.register(jwt, { secret: CDN_SECRET })
  app.register(formbody);

  app.register(router);

  app.decorate('defaultAvatar', `${CDN_URL}/avatars/default/0000-default.jpg`);
  app.decorate('usernameBank', new UsernameBank());

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  app.addHook('onClose', (instance) => {
    // Cleanup instructions for a graceful shutdown
    db.close();
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
