"use strict";

export default function router(fastify, opts, done) {
  let schema = {
    tags: ["[PLACEHOLDER]"],
    description: "[PLACEHOLDER]",
    response: {
      500: {
        description: "[PLACEHOLDER]",
      },
    },
  };

  fastify.get("/", { schema }, async function handler(request, reply) {});

  done();
}
