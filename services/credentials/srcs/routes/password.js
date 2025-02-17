"use strict";

import db from "../app/database.js";
import { objects, properties } from "yatt-utils";

export default function router(fastify, opts, done) {
  let schema = {
    tags: ["Password credentials"],
    description: "Get all password based credentials",
    querystring: {
      type: "object",
      properties: {
        limit: properties.limit,
        offset: properties.offset,
      },
    },
    response: {
      200: {
        type: "array",
        items: {
          type: "object",
          properties: {
            account_id: properties.account_id,
            hash: properties.hash,
            salt: properties.salt,
          },
          required: ["account_id", "hash", "salt"],
        },
      },
    },
  };

  fastify.get("/", { schema }, async function handler(request, reply) {
    const { limit, offset } = request.query;

    return db
      .prepare(`SELECT * FROM password_auth LIMIT ? OFFSET ?`)
      .all(limit, offset);
  });

  schema = {
    tags: ["Password credentials"],
    description:
      "Get the password credentials associated with an email address",
    params: {
      type: "object",
      required: ["email"],
      properties: {
        email: properties.email,
      },
    },
    response: {
      200: {
        description:
          "The account credentials associtated with an email address",
        type: "object",
        properties: {
          account_id: properties.account_id,
          email: properties.email,
          hash: properties.hash,
          salt: properties.salt,
        },
        required: ["account_id", "email", "hash", "salt"],
      },
      404: {
        description: "Account not found",
        type: "object",
        properties: objects.errorBody,
      },
    },
  };

  fastify.get("/:email", { schema }, async function handler(request, reply) {
    const { email } = request.params;

    const account = db
      .prepare(
        `
      SELECT accounts.account_id, accounts.email, password_auth.*
      FROM accounts
      INNER JOIN password_auth
        ON accounts.account_id = password_auth.account_id
      WHERE auth_method = 'password_auth'
        AND email = ?
    `
      )
      .get(email);

    if (!account) {
      reply.status(404).send(accountNotFound);
    }
    return account;
  });

  schema = {
    tags: ["Password credentials"],
    description: "Create a new account with password credentials",
    body: {
      type: "object",
      properties: {
        email: properties.email,
        hash: properties.hash,
        salt: properties.salt,
      },
      required: ["email", "hash", "salt"],
    },
    response: {
      201: {
        description:
          "Successfully created new account with password credentials",
        type: "object",
        properties: {
          account_id: properties.account_id,
          hash: properties.hash,
          salt: properties.salt,
        },
        required: ["account_id", "hash", "salt"],
      },
      409: {
        description: "Email address is already associated with an account",
        type: "object",
        properties: objects.errorBody,
        required: ["statusCode", "code", "error", "message"],
      },
    },
  };

  fastify.post("/", { schema }, async function handler(request, reply) {
    const { email, hash, salt } = request.body;

    try {
      const result = db.transaction(() => {
        const account = db
          .prepare(
            `
          INSERT INTO accounts (email, auth_method)
          VALUES (?, 'password_auth')
          RETURNING account_id
        `
          )
          .get(email);

        return db
          .prepare(
            `
          INSERT INTO password_auth (account_id, hash, salt)
          VALUES (?, ?, ?)
          RETURNING *
        `
          )
          .get(account.account_id, hash, salt);
      })();
      return reply.status(201).send(result);
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return reply.code(409).send(emailInUse);
      }
      console.error(err);
      throw err;
    }
  });

  done();
}

const accountNotFound = {
  statusCode: 404,
  code: "ACCOUNT_NOT_FOUND",
  error: "Account Not Found",
  message: "The requested account does not exist",
};

const emailInUse = {
  statusCode: 409,
  code: "AUTH_EMAIL_IN_USE",
  error: "Email Already In Use",
  message: `This email is already associated with an account`,
};
