'use strict';

import Fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import router from "./router.js";
import YATT from "yatt-utils";

export default function build(opts = {}) {
  const app = Fastify(opts);
  
  if (process.env.ENV !== 'production') {
    YATT.setUpSwagger(app, {
      info: {
        title: "Credentials Service",
        description: "Internal service managing the credential database",
        version: "1.0.0",
      },
      servers: [
        { url: "http://credentials:3000", description: "Containers network" },
        { url: "http://localhost:7002", description: "Development network" }
      ],
    });
  }

  app.register(fastifyFormbody);
  
  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
