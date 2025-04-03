"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import jwt from "@fastify/jwt";
import bearerAuth from "@fastify/bearer-auth";
import cookie from "@fastify/cookie";
import { fastifySchedule } from '@fastify/schedule';
import router from "./router.js";
import YATT, { HttpError } from "yatt-utils";
import { token_manager_secret, jwt_secret, refresh_token_secret } from "./env.js";
import { removeExpiredTokens } from "./schedules.js";
import db from "./database.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  app.register(cors, {
    origin: process.env.CORS_ORIGIN || false,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    maxAge: 600,
  });

  const keys = new Set([token_manager_secret]);
  app.register(bearerAuth, {
    keys,
    addHook: false,
    errorResponse: (err) => {
      return new HttpError.Unauthorized().json();
    },
  });

  app.register(jwt, {
    secret: jwt_secret,
  });

  app.register(jwt, {
    secret: refresh_token_secret,
    namespace: "refresh"
  })

  app.register(cookie)
  app.register(formbody);
  app.register(fastifySchedule);

  app.ready().then(() => {
    app.scheduler.addSimpleIntervalJob(removeExpiredTokens);
  });

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  app.addHook('onClose', (instance) => {
    // Cleanup instructions for a gracefull shutdown
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
