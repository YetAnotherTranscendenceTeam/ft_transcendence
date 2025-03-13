"use strict";

import token from "../routes/token.js";
import refresh from "../routes/refresh.js";

export default function router(fastify, opts, done) {
  fastify.register(token);
  fastify.register(refresh);
  done();
}
