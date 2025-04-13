"use strict";

import Fastify from "fastify";
import cors from "@fastify/cors";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import jwt from "@fastify/jwt";
import JwtGenerator from "yatt-jwt";
import bearerAuth from "@fastify/bearer-auth";
import formbody from "@fastify/formbody";
import cookie from "@fastify/cookie";
import router from "./router.js";
import { HttpError } from "yatt-utils";
import { TOKEN_MANAGER_SECRET, AUTHENTICATION_SECRET } from "./env.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  app.register(cors, {
    origin: process.env.CORS_ORIGIN || false,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    maxAge: 600,
  });

  app.register(jwt, { secret: AUTHENTICATION_SECRET });
  app.register(jwt, { secret: TOKEN_MANAGER_SECRET, namespace: "token_manager" });
  app.decorate("tokens", new JwtGenerator());
  app.addHook('onReady', async function () {
    this.tokens.register(app.jwt.token_manager, "token_manager");
  });

  // Setup shema compiler
  const ajv = new Ajv();
  addFormats(ajv);
  app.setValidatorCompiler(({ schema }) => ajv.compile(schema));

  const serviceAuthorization = (token, request) => {
    try {
      const decoded = app.jwt.verify(token);
      if (decoded.refresh) return false;
      request.acess_token = token;
      request.account_id = decoded.account_id;
    } catch (err) {
      return false;
    }
    return true;
  };


  app.register(bearerAuth, {
    auth: serviceAuthorization,
    addHook: true,
    errorResponse: (err) => {
      return new HttpError.Unauthorized().json();
    },
  });

  app.register(formbody);
  app.register(cookie);

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
