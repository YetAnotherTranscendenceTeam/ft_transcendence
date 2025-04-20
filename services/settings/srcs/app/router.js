"use strict";

import profile from "../routes/profile.js";
import account from "../routes/account.js";

export default function router(fastify, opts, done) {
  fastify.register(profile);
  fastify.register(account);
  done();
}
