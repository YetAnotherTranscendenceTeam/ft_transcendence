"use strict";

import YATT, { HttpError, properties } from "yatt-utils";

export default function router(fastify, opts, done) {
  let schema = {
    params: {
      type: "object",
      properties: {
        email: properties.username,
      },
      required: ["username"],
      additionalProperties: false,
    },
  }

  fastify.get("/available/:username", { schema }, async function handler(request, reply) {
    const { username } = request.params;

    try {
      await YATT.fetch(`http://db-profiles:3000/usernames/${username}`);
      reply.code(403).send();
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.statusCode === 404) {
          reply.code(204).send();
        } else {
          err.send(reply);
        }
      } else {
        throw err;
      }
    }
  });

  done();
}
