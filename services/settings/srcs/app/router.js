"use strict";

import root from "../routes/root.js";
import profile from "../routes/profile.js";

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(profile);
  done();
}
