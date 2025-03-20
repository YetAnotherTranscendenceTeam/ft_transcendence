"use strict";

import { properties } from "yatt-utils";
import { generateTokens } from "../utils/generate.js";
import db from "../app/database.js";

export default function router(fastify, opts, done) {
  let schema = {
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id,
      },
      required: ["account_id"],
      additionalProperties: false,
    }
  };

  fastify.post("/:account_id", { schema, preHandler: fastify.verifyBearerAuth },
    async function handler(request, reply) {
      const { account_id } = request.params;

      const tokens = generateTokens(fastify, account_id);
      reply.send(tokens);
      console.log("AUTH:", { account_id });
    }
  );

  schema = {
    headers: {
      type: 'object',
      properties: {
        'Cookie': { type: 'string' }
      },
      required: ['Cookie']
    },
  };

  fastify.post("/revoke", { schema }, async function handler(request, reply) {
    const token = request.cookies.refresh_token;

    reply.clearCookie("refresh_token", {
      path: "/token",
    });
    const deletion = db.prepare("DELETE FROM refresh_tokens WHERE token = ? RETURNING *").get(token);
    if (deletion) {
      console.log("REVOKE:", { account_id: deletion.account_id });
    }
    reply.code(204).send();
  }
  );

  done();
}
