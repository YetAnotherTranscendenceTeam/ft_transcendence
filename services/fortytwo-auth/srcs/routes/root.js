"use strict";

import { API42_CLIENT_ID, API42_REDIRECT_URI } from "../app/env.js";

export default function routes(fastify, opts, done) {
  fastify.get("/", async function handler(request, reply) {
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=${API42_CLIENT_ID}&redirect_uri=${API42_REDIRECT_URI}&response_type=code&scope=public`;
    reply.redirect(url);
  });

  done();
}
