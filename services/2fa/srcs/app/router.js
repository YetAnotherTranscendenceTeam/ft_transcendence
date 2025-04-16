"use strict";

import root from "../routes/root.js";
import activate from "../routes/activate.js";
// import deactivate from "../routes/deactivate.js";

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(activate);
  // fastify.register(deactivate);
  done();
}
