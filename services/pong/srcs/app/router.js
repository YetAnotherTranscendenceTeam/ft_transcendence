"use strict";

import root from "../routes/root.js";
import join from "../routes/join.js";
import match from "../routes/matches.js";

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(join, { prefix: '/join' });
  fastify.register(match, { prefix: '/matches' });
  done();
}
