"use strict";

import notify from "../routes/notify.js";
import requests from "../routes/requests.js";
import blocks from "../routes/blocks.js";
import friends from "../routes/friends.js";

export default function router(fastify, opts, done) {
  fastify.register(notify);
  fastify.register(requests);
  fastify.register(blocks);
  fastify.register(friends);
  done();
}
