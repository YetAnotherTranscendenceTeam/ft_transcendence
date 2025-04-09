"use strict";

import root from "../routes/root.js";
import password from "../routes/password.js";
import fortytwo from "../routes/fortytwo.js";
import googleRoutes from "../routes/google.js";

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(password, { prefix: "/password" });
  fastify.register(fortytwo, { prefix: "/fortytwo" });
  fastify.register(googleRoutes)
  done();
}
