"use strict";

import root from "../routes/root.js";
import usernames from "../routes/usernames.js";

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(usernames);
  done();
}
