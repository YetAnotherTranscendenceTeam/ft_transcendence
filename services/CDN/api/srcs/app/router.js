"use strict";

import avatars from "../routes/avatars/root.js";

export default function router(fastify, opts, done) {
  fastify.register(avatars, { prefix: 'avatars' });
  done();
}
