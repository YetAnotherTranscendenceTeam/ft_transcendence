"use strict";

import Fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import router from "./router.js";
import { jwt_secret } from './env.js';

export default function build(opts = {}) {
  const app = Fastify(opts);

  if (process.env.ENV !== "production") {
    
  } else {

  }

  app.register(fastifyFormbody);
  app.register(fastifyCookie);
  app.register(fastifyJWT, {
    secret: jwt_secret,
    cookie: {
      cookieName: 'access_token',
      signed: false
    }
  })
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
