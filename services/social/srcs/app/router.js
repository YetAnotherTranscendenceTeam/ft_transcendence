"use strict";

import root from "../routes/root.js";
import follows from "../routes/follows.js";

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(follows);
  done();
}
