'use strict';

import { properties } from "yatt-utils";
import db from "../app/database.js";

export default function router(fastify, opts, done) {
  let schema;

  // Get fortytwo_auth table entries
  fastify.get("/", { schema }, async function handler(request, reply) {
    const { limit, offset } = request.query;

    return db
      .prepare(`SELECT * FROM fortytwo_auth LIMIT ? OFFSET ?`)
      .all(safeLimit, safeOffset);
  });

  // Get the account associated to a 42intra intra_user_id
  fastify.get("/:intra_user_id", async function handler(request, reply) {
    const { intra_user_id } = request.params;

    const account = db
      .prepare(
        `
      SELECT accounts.account_id, accounts.email, fortytwo_auth.*
      FROM accounts
      INNER JOIN fortytwo_auth
        ON accounts.account_id = fortytwo_auth.account_id
      WHERE auth_method = 'fortytwo_auth'
        AND fortytwo_auth.intra_user_id = ?;
    `
      )
      .get(intra_user_id);

    if (!account) {
      reply.status(404).send({ error: "Account not found" });
    }
    return account;
  });

  // Create a fortytwo auth based account
  schema = {
    body: {
      type: "object",
      properties: {
        email: properties.email,
        intra_user_id: properties.intra_user_id
      },
      required: ["email", "intra_user_id"],
    },
  };

  fastify.post("/", { schema }, async function handler(request, reply) {
    const { email, intra_user_id } = request.body;

    try {
      const result = db.transaction(() => {
        const account = db
          .prepare(
            `
          INSERT INTO accounts (email, auth_method)
          VALUES (?, 'fortytwo_auth')
          RETURNING account_id
        `
          )
          .get(email);

        return db
          .prepare(
            `
          INSERT INTO fortytwo_auth (account_id, intra_user_id)
          VALUES (?, ?)
          RETURNING *
        `
          )
          .get(account.account_id, intra_user_id);
      })();
      return reply.status(201).send(result);
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return reply.code(409).send({
          statusCode: 409,
          code: "AUTH_EMAIL_IN_USE",
          error: "Email Already In Use",
          message: `This email is already associated with an account`,
        });
      }
      console.error(err);
      throw err;
    }
  });

  done();
}
