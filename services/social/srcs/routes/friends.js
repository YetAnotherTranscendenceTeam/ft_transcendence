"use strict";

import { HttpError, properties } from "yatt-utils";
import * as dbAction from "../utils/dbAction.js"

export default function router(fastify, opts, done) {
  fastify.get("/friends", { preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    return dbAction.selectFriendships(request.account_id);
  })

  let schema = {
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id
      },
      required: ["account_id"],
      additionalProperties: false,
    },
  };

  fastify.delete("/friends/:account_id", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request.params;

    const deletion = dbAction.removeFriend(request.account_id, account_id);
    if (deletion.changes === 0) {
      throw new HttpError.NotFound();
    }
    reply.code(204).send();

    // Send notifications through websocket(s)
    await fastify.clients.deleteFriendship(request.account_id, account_id);
  });

  done();
}
