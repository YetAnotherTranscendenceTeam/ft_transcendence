"use strict";

import { HttpError } from "yatt-utils";

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

  fastify.get("/refresh", { schema }, async function handler(request, reply) {
    new HttpError.Forbidden("Not implemented yet").send(reply);
  });

  done();
}
