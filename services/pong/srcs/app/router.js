"use strict";

import join from "../routes/join.js";
import match from "../routes/matches.js";
import spectate from "../routes/spectate.js";

export default function router(fastify, opts, done) {
  fastify.register(join, { prefix: '/join' });
  fastify.register(match, { prefix: '/matches' });
  fastify.register(spectate, { prefix: '/spectate' });
  done();
}
