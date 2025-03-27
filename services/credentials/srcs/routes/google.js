'use strict';

import { properties, objects } from "yatt-utils";
import db from "../app/database.js";
import { createProfile } from "../utils/createProfile.js";

export default function router(fastify, opts, done) {
  let schema = {
    tags: ["Google"],
    description: "Get all Google Sign in based credentials",
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
            google_id: properties.google_id,
          },
          required: ["account_id", "google_id"],
        },
      },
    },
  };

  // Get google_auth table entries
  fastify.get("/google", { schema }, async function handler(request, reply) {
    const { limit, offset } = request.query;

    return db
      .prepare(`SELECT * FROM google_auth LIMIT ? OFFSET ?`)
      .all(limit, offset);
  });

  // Get the account associated to a google_id
  fastify.get("/google/:google_id", async function handler(request, reply) {
    const { google_id } = request.params;

    const account = db.prepare(`
      SELECT accounts.account_id, accounts.email, google_auth.*
      FROM accounts
      INNER JOIN google_auth
        ON accounts.account_id = google_auth.account_id
      WHERE auth_method = 'google_auth'
        AND google_auth.google_id = ?;
    `).get(google_id);

    if (!account) {
      reply.status(404).send({ error: "Account not found" });
    }
    return account;
  });

  // Create a google_id based account
  fastify.post("/google", async function handler(request, reply) {
    const { email, google_id } = request.body;

    try {
      const result = db.transaction(() => {
        const accountId = db.prepare(`
            INSERT INTO accounts (email, auth_method)
            VALUES (?, 'google_auth')
            RETURNING account_id
          `).get(email);

        return db.prepare(`
            INSERT INTO google_auth (account_id, google_id)
            VALUES (?, ?)
            RETURNING *
          `).get(accountId.account_id, google_id);
      })();
      await createProfile(result.account_id);
      reply.status(201).send(result);
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return reply.code(409).send(objects.emailInUse);
      }
      console.error(err);
      throw err;
    }
  });

  done();
}
