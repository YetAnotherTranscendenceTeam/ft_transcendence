"use strict";

import follows from "../routes/follows.js";
import notify from "../routes/notify.js";

export default function router(fastify, opts, done) {
  fastify.register(follows);
  fastify.register(notify);
  done();
}
