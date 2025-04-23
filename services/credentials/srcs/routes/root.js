"use strict";

import { objects, properties } from "yatt-utils";
import db from "../app/database.js";
import * as dbAction from "../utils/dbAction.js";

export default function router(fastify, opts, done) {
  let schema = {
    description: "Get all the accounts",
    querystring: {
      type: "object",
      properties: {
        limit: properties.limit,
        offset: properties.offset,
      },
    },
  };

  fastify.get("/", { schema }, async function handler(request, reply) {
    const { limit, offset } = request.query;

    return db
      .prepare(`SELECT * FROM accounts LIMIT ? OFFSET ?`)
      .all(limit, offset);
  });

  schema = {
    description: "Get the account associated with an account_id",
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id,
      },
      required: ["account_id"],
    },
  };

  fastify.get("/:account_id", { schema }, async function handler(request, reply) {
    const { account_id } = request.params;

    const query = dbAction.getById(account_id);
    if (!query) {
      reply.status(404).send(objects.accountNotFound);
    }

    // Add array of multi authentication methods
    query.otp_methods = dbAction.getOTPMethods(account_id);
    return query;
  });

  schema = {
    description: "Delete the account associated with an id",
    params: {
      type: "object",
      required: ["account_id"],
      properties: {
        account_id: properties.account_id,
      },
    },
  };

  fastify.delete("/:account_id", { schema }, async function handler(request, reply) {
      const { account_id } = request.params;

      const result = db.prepare(`DELETE FROM accounts WHERE account_id = (?)`)
        .run(account_id);
      if (!result.changes) {
        reply.code(404).send(objects.accountNotFound); 
      } else {
        reply.code(204).send();
      }
    }
  );

  done();
}
