"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'

export default function build(opts = {}) {
  const app = Fastify(opts);

  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authentication)
  });

  app.register(swagger, {
    mode: 'static',
    specification: {
      path: '/documentation/backend.yaml',
      postProcessor: function (swaggerObject) {
        return swaggerObject
      },
    }
  })

  app.register(swaggerUI, {
    routePrefix: '/',
  });

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  return app;
}
