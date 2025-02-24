"use strict";

import { client_id, redirect_uri } from "../app/env.js";

export default function routes(fastify, opts, done) {
  let schema = {
    summary: "42 API OAuth redirection",
    description: "Redirect to OAuth authorization for 42 API",
    tags: ["Authentication"],
    response: {
      302: {
        description: "Redirect to 42 API OAuth authorization",
        headers: {
          Location: {
            type: "string",
            description: "URL of the OAuth authorization endpoint",
          },
        },
        body: {
          type: "null",
          description: "No body content is returned in the response",
        },
      },
    },
  };

  fastify.get("/", { schema }, async function handler(request, reply) {
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=public`;
    reply.redirect(url);
  });

  done();
}
