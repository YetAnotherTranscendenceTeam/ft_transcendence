"use strict";

import bearerAuth from "@fastify/bearer-auth";
import { HttpError } from "yatt-utils";
import root from "../routes/totp/root.js";
import activate from "../routes/totp/activate.js";
import deactivate from "../routes/totp/deactivate.js";

function protected_router(fastify, opts, done) {
  const serviceAuthorization = (token, request) => {
    try {
      fastify.jwt.two_fa.verify(token);
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
  fastify.register(root);
  done();
}

export default function router(fastify, opts, done) {
  fastify.register(activate);
  fastify.register(deactivate);
  fastify.register(protected_router);
  done();
}
