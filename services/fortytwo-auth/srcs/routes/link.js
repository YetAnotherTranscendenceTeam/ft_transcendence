"use strict";

import { client_id, redirect_uri } from "../app/env.js";

export default function routes(fastify, opts, done) {
  let schema = {
    summary: "Retrieve 42 API OAuth link",
    description: "Get OAuth authorization link for 42 API",
    tags: ["Authentication"],
    response: {
      200: {
        type: "object",
        properties: {
          link: {
            type: "string",
            format: "uri",
            example:
              "https://api.intra.42.fr/oauth/authorize?client_id=example_id&redirect_uri=example_uri&response_type=code&scope=public",
          },
        },
        required: ["link"],
      },
    },
  };

  fastify.get("/link", { schema }, async function handler(request, reply) {
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=public`;
    reply.send({
      link: url,
    });
  });

  done();
}
