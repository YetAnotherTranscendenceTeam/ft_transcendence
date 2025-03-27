"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import cookie from '@fastify/cookie';
import router from "./router.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  app.register(cors, {
    origin: true,
    methods: ["POST"],
    credentials: true,
  });

  app.register(formbody);
  app.register(cookie);
  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
