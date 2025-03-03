"use strict";

import root from "../routes/root.js";

export default function router(fastify, opts, done) {
  fastify.register(root);
  done();
}
