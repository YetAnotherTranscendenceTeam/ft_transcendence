"use strict";

import root from "../routes/root.js";
import me from "../routes/me.js";

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(me);
  done();
}
