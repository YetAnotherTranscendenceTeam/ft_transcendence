"use strict";

import bearerAuth from "@fastify/bearer-auth";
import { HttpError } from "yatt-utils";
import root from "../routes/root.js";
import notify from "../routes/notify.js";

function protected_router(fastify, opts, done) {
  const serviceAuthorization = (token, request) => {
    try {
      fastify.jwt.activity_sse.verify(token);
      request.token = token;
    } catch (err) {
      return false;
    }
    return true;
  };
  fastify.register(bearerAuth, {
    auth: serviceAuthorization,
    errorResponse: (err) => {
      return new HttpError.Unauthorized().json();
    },
  });
  fastify.register(notify);

  done();
}

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(protected_router);

  done();
}
