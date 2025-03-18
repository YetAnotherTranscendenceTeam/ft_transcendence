"use strict";

import db from "../app/database.js";
import YATT, { HttpError, properties } from "yatt-utils";

export default function router(fastify, opts, done) {
  fastify.get("/follows", { preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const follows = db.prepare("SELECT following, created_at FROM follows WHERE account_id = ?").all(request.account_id);
    reply.send(follows);
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

  fastify.post("/follows/:account_id", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request.params;

    if (request.account_id === account_id) {
      return new HttpError.Forbidden("Cannot follow your own account").send(reply);
    }

    try {
      // Verify account exists
      await YATT.fetch(`http://db-profiles:3000/${account_id}`);

      const insert = db.prepare("INSERT INTO follows (account_id, following) VALUES (?, ?) RETURNING *").get(request.account_id, account_id);
      reply.code(204).send();
      console.log("FOLLOW:", insert);

      // Send notification through websocket(s)
      await fastify.clients.get(request.account_id)?.follow(account_id, fastify.clients);

    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        new HttpError.Conflict("Already following this account").send(reply);
      } else if (err.code === "SQLITE_CONSTRAINT_TRIGGER") {
        new HttpError.Conflict(err.message).send(reply);
      } else {
        console.error(err);
        throw err;
      }
    }
  });

  fastify.delete("/follows/:account_id", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request.params;

    if (request.account_id === account_id) {
      return new HttpError.BadRequest().send(reply);
    }
    const remove = db.prepare("DELETE FROM follows WHERE account_id = ? AND following = ? RETURNING *").get(request.account_id, account_id);
    if (remove) {
      reply.code(204).send();
      console.log("UNFOLLOW:", remove);

      // Send notification through websocket(s)
      await fastify.clients.get(request.account_id)?.unfollow(account_id);

    } else {
      new HttpError.NotAcceptable().send(reply);
    }
  });

  done();
}
