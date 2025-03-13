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

  return app;
}
