"use strict";

const schema = {
  body: {
    type: "object",
    properties: {
      token: { type: "string" },
    },
    required: ["token"],
    additionalProperties: false,
  }
}

export default function routes(fastify, opts, done) {
  fastify.post("/", { schema }, async function handler(request, reply) {
    const { token } = request.body;
  });

  done();
}
