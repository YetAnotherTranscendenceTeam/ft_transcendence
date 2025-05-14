"use strict";

import join from "../routes/join.js";

export default function router(fastify, opts, done) {
  fastify.register(join);
  done();
}
