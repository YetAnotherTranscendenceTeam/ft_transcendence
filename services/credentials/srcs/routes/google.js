'use strict';

import { properties, objects } from "yatt-utils";
import db from "../app/database.js";
import { createProfile } from "../utils/createProfile.js";

export default function router(fastify, opts, done) {
  let schema = {
    description: "Get the accounts using Google Sign in",
    querystring: {
      type: "object",
      properties: {
        limit: properties.limit,
        offset: properties.offset,
      },
      additionalProperties: false,
    },
  };

  fastify.get("/google", { schema }, async function handler(request, reply) {
    const { limit, offset } = request.query;

    return db.prepare(`SELECT * FROM google_auth LIMIT ? OFFSET ?`).all(limit, offset);
  });

  schema = {
    description: "Get the account associated to a google_id",
    params: {
      type: "object",
      properties: {
        google_id: properties.google_id
      },
      required: ["google_id"],
      additionalProperties: false,
    }
  }

  fastify.get("/google/:google_id", { schema }, async function handler(request, reply) {
    const { google_id } = request.params;

    const account = db.prepare(`
      SELECT accounts.account_id, accounts.email, google_auth.*
      FROM accounts
      INNER JOIN google_auth
        ON accounts.account_id = google_auth.account_id
      WHERE auth_method = 'google_auth'
        AND google_auth.google_id = ?;
    `).get(google_id.toString());

    if (!account) {
      reply.status(404).send({ error: "Account not found" });
    }
    return account;
  });

  schema = {
    description: "Create a google_id based account",
    body: {
      type: "object",
      properties: {
        email: properties.email,
        google_id: properties.google_id,
      },
      required: ["email", "google_id"],
      additionalProperties: false,
    }
  }

  fastify.post("/google", { schema }, async function handler(request, reply) {
    const { email, google_id } = request.body;

    try {
      const result = db.transaction(() => {
        const insert = db.prepare(`
          INSERT INTO accounts (email, auth_method)
          VALUES (?, 'google_auth')
          RETURNING account_id
        `).get(email);

        return db.prepare(`
          INSERT INTO google_auth (account_id, google_id)
          VALUES (?, ?)
          RETURNING *
        `).get(insert.account_id, google_id.toString());
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
