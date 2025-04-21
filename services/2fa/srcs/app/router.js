"use strict";

import bearerAuth from "@fastify/bearer-auth";
import { HttpError } from "yatt-utils";
import verifyApp from "../routes/app/verify.js";
import activateApp from "../routes/app/activate.js";
import deactivateApp from "../routes/app/deactivate.js";

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
  fastify.register(verifyApp);
  done();
}

export default function router(fastify, opts, done) {
  fastify.register(activateApp);
  fastify.register(deactivateApp);
  fastify.register(protected_router);
  done();
}
