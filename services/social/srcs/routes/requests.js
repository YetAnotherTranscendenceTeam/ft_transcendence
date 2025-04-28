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
    const sender = request.account_id;
    const receiver = request.params.account_id;

    try {
      // Verify account exists
      const profile = await YATT.fetch(`http://db-profiles:3000/${receiver}`);

      // 
      const friendship = dbAction.handleFriendRequest(sender, receiver);
      // Send notification through websocket(s)
      if (friendship) {
        await fastify.clients.newFriendship(sender, receiver, profile);
      } else {
        await fastify.clients.newFriendRequest(sender, receiver, profile);
      }
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        throw new HttpError.Conflict().setCode("PENDING");
      } if (err.code === "SQLITE_CONSTRAINT_TRIGGER") {
        throw new HttpError.Forbidden().setCode(err.message);
      } else if (err.code === "SQLITE_CONSTRAINT_CHECK") {
        throw new HttpError.Forbidden().setCode("SELF_REQUEST");
      } else {
        console.error(err);
        throw err;
      }
    }
    reply.code(204);
  });

  fastify.delete("/requests/:account_id", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const actor = request.account_id;
    const target = request.params.account_id;

    const deletion = dbAction.cancelFriendRequest(actor, target);
    if (!deletion) {
      throw new HttpError.NotFound();
    }

    // Send notification through websocket(s)
    fastify.clients.deleteFriendRequest(deletion.sender, deletion.receiver);

    reply.code(204);
  });

  done();
};
