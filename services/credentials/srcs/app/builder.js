"use strict";

import Fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import router from "./router.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  app.register(fastifyFormbody);

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
