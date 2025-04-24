"use strict";

import YATT, { HttpError, properties } from "yatt-utils";
import * as dbAction from "../utils/dbAction.js"

export default function router(fastify, opts, done) {

  const schema = {
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id
      },
      required: ["account_id"],
      additionalProperties: false,
    },
  };

  fastify.post("/requests/:account_id", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request.params;

    try {
      // Verify account exists
      await YATT.fetch(`http://db-profiles:3000/${account_id}`);

      const friendship = dbAction.handleFriendRequest(request.account_id, account_id);
      if (friendship) {
        console.log("NEW FRIENDSHIP:", [request.account_id, account_id]);
      } else {
        console.log("FRIEND REQUEST:", { from_user: request.account_id, to_user: account_id });
      }
      reply.code(204);

      // // Send notification through websocket(s)
      // await fastify.clients.get(request.account_id)?.follow(account_id, fastify.clients);

    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT_CHECK") {
        throw new HttpError.Forbidden().setCode("SELF_REQUEST");
      } else if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        throw new HttpError.Conflict().setCode("PENDING");
      } else if (err.code === "SQLITE_CONSTRAINT_TRIGGER") {
        throw new HttpError.Forbidden().setCode(err.message);
      } else {
        console.error(err);
        throw err;
      }
    }
  });

  fastify.delete("/requests/:account_id", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request.params;

    const deletion = dbAction.cancelFriendRequest(request.account_id, account_id);
    if (deletion.changes === 0) {
      throw new HttpError.NotFound();
    }
    reply.code(204).send();

    // Send notification through websocket(s)
    // await fastify.clients.get(request.account_id)?.unfollow(account_id);
  });

  done();
}
