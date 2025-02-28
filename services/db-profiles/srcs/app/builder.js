"use strict";

import Fastify from "fastify";
import formbody from "@fastify/formbody";
import router from "./router.js";
import YATT from "yatt-utils";

export default function build(opts = {}) {
  const app = Fastify(opts);

  if (process.env.ENV !== "production") {
    // DEVELOPEMENT configuration
    YATT.setUpSwagger(app, {
      info: {
        title: "[PLACEHOLDER]",
        description: "[PLACEHOLDER]",
        version: "1.0.0",
      },
      servers: [
        { url: "http://localhost:7001", description: "Development network" },
        { url: "http://profiles:3000", description: "Containers network" },
      ],
    });
  }

  app.register(formbody);
  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
