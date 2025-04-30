"use strict";

import root from "../routes/root.js";
import notify from "../routes/notify.js";

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(notify);
  done();
}
