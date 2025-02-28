"use strict";

import callback from "../routes/callback.js";
import link from "../routes/link.js";
import root from "../routes/root.js";

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(link);
  fastify.register(callback);
  done();
}
