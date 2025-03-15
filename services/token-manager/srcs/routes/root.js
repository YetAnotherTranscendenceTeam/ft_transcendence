"use strict";

import { properties } from "yatt-utils";
import db from "../app/database.js";

export default function router(fastify, opts, done) {
  let schema = {
    params: {
      type: 'object',
      properties: {
        account_id: properties.account_id,
      },
      required: ['account_id'],
    },
  }

  fastify.delete("/:account_id", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request.params;

    const deletion = db.prepare("DELETE FROM refresh_tokens WHERE account_id = ?").run(account_id);
    console.log("DELETE:", { account_id, tokens: deletion.changes });
    reply.code(204).send();
  });

  done();
}
