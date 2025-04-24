"use strict";

import YATT, { HttpError, properties } from "yatt-utils";
import * as dbAction from "../utils/dbAction.js"

export default function router(fastify, opts, done) {
  fastify.get("/blocks", { preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    return dbAction.selectBlocks(request.account_id);
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

  fastify.post("/blocks/:account_id", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request.params;

    try {
      // Verify account exists
      await YATT.fetch(`http://db-profiles:3000/${account_id}`);

      const block = dbAction.handleBlock(request.account_id, account_id);
      reply.code(204);
      // // Send notification through websocket(s)
      // await fastify.clients.get(request.account_id)?.follow(account_id, fastify.clients);

    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT_CHECK") {
        throw new HttpError.Forbidden().setCode("SELF_BLOCK");
      } else if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        throw new HttpError.Conflict();
      } else if (err.code === "SQLITE_CONSTRAINT_TRIGGER") {
        throw new HttpError.Forbidden().setCode(err.message);
      } else {
        console.error(err);
        throw err;
      }
    }
  });

  fastify.delete("/blocks/:account_id", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request.params;

    const unblock = dbAction.deleteBlock(request.account_id, account_id);
    if (unblock.changes === 0) {
      throw new HttpError.NotFound();
    }
    reply.code(204).send();
    console.log("UNBLOCK:", { from_user: request.account_id, to_user: account_id });

    // Send notification through websocket(s)
    // await fastify.clients.get(request.account_id)?.unfollow(account_id);
  });

  done();
}
