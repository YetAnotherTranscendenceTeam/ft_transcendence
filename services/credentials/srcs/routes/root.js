"use strict";

import { objects, properties } from "yatt-utils";
import db from "../app/database.js";

export default function router(fastify, opts, done) {
  let schema = {
    tags: ["Accounts"],
    description: "Get all the accounts",
    querystring: {
      type: "object",
      properties: {
        limit: properties.limit,
        offset: properties.offset,
      },
    },
    response: {
      200: {
        description: "Successful response",
        type: "array",
        items: {
          type: "object",
          properties: {
            account_id: properties.account_id,
            email: properties.email,
            auth_method: properties.auth_method,
            created_at: properties.created_at,
            updated_at: properties.updated_at,
          },
          required: [
            "account_id",
            "email",
            "auth_method",
            "created_at",
            "updated_at",
          ],
        },
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
    tags: ["Accounts"],
    description: "Get the account associated with an account_id",
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id,
      },
      required: ["account_id"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          account_id: properties.account_id,
          email: properties.email,
          auth_method: properties.auth_method,
          created_at: properties.created_at,
          updated_at: properties.updated_at,
        },
      },
      404: {
        type: "object",
        properties: objects.errorBody,
        description: "Account not found",
      },
    },
  };

  fastify.get("/:account_id", { schema }, async function handler(request, reply) {
    const { account_id } = request.params;

    const account = db
      .prepare(`SELECT * FROM accounts WHERE account_id = ?`)
      .get(account_id);

    if (!account) {
      reply.status(404).send(objects.accountNotFound);
    }
    return account;
  });

  schema = {
    description: "Delete the account associated with an id",
    tags: ["Accounts"],
    params: {
      type: "object",
      required: ["account_id"],
      properties: {
        account_id: properties.account_id,
      },
    },
    response: {
      204: {
        description: "Account successfully deleted",
        type: "null",
      },
      404: {
        description: "Account not found",
        type: "object",
        properties: objects.errorBody,
      },
    },
  };

  fastify.delete("/:account_id", { schema }, async function handler(request, reply) {
      const { account_id } = request.params;

      const result = db
        .prepare(`DELETE FROM accounts WHERE account_id = (?)`)
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
