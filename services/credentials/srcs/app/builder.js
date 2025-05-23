"use strict";

import Fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import router from "./router.js";
import db from "./database.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  app.register(fastifyFormbody);

  app.register(router);

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
