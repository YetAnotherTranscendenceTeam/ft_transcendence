"use strict";

import { properties } from "yatt-utils";

export default function router(fastify, opts, done) {
  let schema = {
    summary: "JWT Generation",
    description: "Generate a JWT token for a given account ID",
    tags: ["Access token"],
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id,
      },
      required: ["account_id"],
    },
    headers: {
      type: "object",
      properties: {
        Authorization: {
          type: "string",
          description: "Bearer token for authentication",
        },
      },
      required: ["Authorization"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          access_token: properties.access_token,
          refresh_token: properties.access_token,
          expire_at: properties.expire_at,
        },
        required: ["access_token", "refresh_token", "expire_at"],
      },
    },
  };

  fastify.post(
    "/token/:account_id",
    { schema, preHandler: fastify.verifyBearerAuth },
    async function handler(request, reply) {
      const { account_id } = request.params;

      reply.send({
        access_token: fastify.jwt.sign({ account_id }, { expiresIn: "15m" }),
        refresh_token: fastify.jwt.sign({ account_id }, { expiresIn: "7d" }),
        expire_at: new Date(new Date().getTime() + 15 * 60000),
      });
    }
  );

  done();
}
