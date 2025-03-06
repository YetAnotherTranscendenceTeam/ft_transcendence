"use strict";

import Fastify from "fastify";
import formbody from "@fastify/formbody";
import jwt from "@fastify/jwt";
import router from "./router.js";
import YATT from "yatt-utils";
import { cdn_jwt_secret, cdn_url } from "./env.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  if (process.env.ENV !== "production") {
    // DEVELOPEMENT configuration
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

  app.register(jwt, {
    secret: cdn_jwt_secret,
  })
  app.register(formbody);

  app.register(router);

  app.decorate('defaultAvatar', `${cdn_url}/avatars/default/0000-default.jpg`);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });
  
  return app;
}
