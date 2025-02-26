"use strict";

import { client_id, redirect_uri } from "../app/env.js";

export default function routes(fastify, opts, done) {
  fastify.get("/link", async function handler(request, reply) {
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=public`;
    reply.send({
      link: url,
    });
  });

  done();
}
