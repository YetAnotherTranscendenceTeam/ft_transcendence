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
    description: "Get the account associated with an email address",
    params: {
      type: "object",
      required: ["email"],
      properties: {
        email: {
          type: "string",
          format: "email",
          description: "The email address of the account to retrieve",
        },
      },
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

  fastify.get("/:email", { schema }, async function handler(request, reply) {
    const { email } = request.params;

    const account = db
      .prepare(`SELECT * FROM accounts WHERE email = ?`)
      .get(email);

    if (!account) {
      reply.status(404).send(accountNotFound);
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

  fastify.delete(
    "/:account_id",
    { schema },
    async function handler(request, reply) {
      const { account_id } = request.params;

      const result = db
        .prepare(`DELETE FROM accounts WHERE account_id = (?)`)
        .run(account_id);
      if (!result.changes) {
        reply.code(404).send(accountNotFound);
      } else {
        reply.code(204).send();
      }
    }
  );

  done();
}

const accountNotFound = {
  statusCode: 404,
  code: "ACCOUNT_NOT_FOUND",
  error: "Account Not Found",
  message: "The requested account does not exist",
};
