"use strict";

import root from "../routes/totp/root.js";
import activate from "../routes/totp/activate.js";
import deactivate from "../routes/totp/deactivate.js";

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(activate);
  fastify.register(deactivate);
  done();
}
