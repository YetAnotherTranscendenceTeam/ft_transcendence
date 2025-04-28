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
    const blocker_id = request.account_id;
    const blocked_id = request.params.account_id;

    try {
      // Verify account exists
      await YATT.fetch(`http://db-profiles:3000/${blocked_id}`);

      const { friends, requests, blocks } = dbAction.handleBlock(blocker_id, blocked_id);
    
      // Send notifications through websocket(s)
      console.error(friends, requests, blocks);
      if(friends.changes !== 0) {
        await fastify.clients.deleteFriendship(blocker_id, blocked_id);
      }
      if(requests) {
        await fastify.clients.deleteFriendRequest(requests.sender, requests.receiver, { force: requests.receiver });
      }
      if(blocks.changes !== 0) {
        await fastify.clients.get(blocker_id)?.newBlock(blocked_id);
      }
      reply.code(204);

    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        throw new HttpError.Conflict().setCode("BLOCKED");
      } else if (err.code === "SQLITE_CONSTRAINT_TRIGGER") {
        throw new HttpError.Forbidden().setCode(err.message);
      } else if (err.code === "SQLITE_CONSTRAINT_CHECK") {
        throw new HttpError.Forbidden().setCode("SELF_BLOCK");
      } else {
        console.error(err);
        throw err;
      }
    }
  });

  fastify.delete("/blocks/:account_id", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const blocker_id = request.account_id;
    const blocked_id = request.params.account_id;

    const deletion = dbAction.deleteBlock(blocker_id, blocked_id);
    if (deletion.changes === 0) {
      throw new HttpError.NotFound();
    }
    reply.code(204).send();

    // Send notification through websocket(s)
    await fastify.clients.get(blocker_id)?.deleteBlock(blocked_id);
  });

  done();
};
