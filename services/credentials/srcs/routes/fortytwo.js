"use strict";

import { objects, properties } from "yatt-utils";
import db, { updateEmail } from "../app/database.js";
import { createProfile } from "../utils/createProfile.js";
import { HttpError } from "yatt-utils";

export default function router(fastify, opts, done) {
  let schema = {
    tags: ["42Intra credentials"],
    description: "Get all 42Intra based credentials",
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
            intra_user_id: properties.intra_user_id,
          },
          required: ["account_id", "intra_user_id"],
        },
      },
    },
  };

  fastify.get("/", { schema }, async function handler(request, reply) {
    const { limit, offset } = request.query;

    return db
      .prepare(`SELECT * FROM fortytwo_auth LIMIT ? OFFSET ?`)
      .all(limit, offset);
  });

  schema = {
    tags: ["42Intra credentials"],
    description: "Get the account associated with a specific 42Intra user_id",
    params: {
      type: "object",
      required: ["intra_user_id"],
      properties: {
        intra_user_id: properties.intra_user_id,
      },
    },
    response: {
      200: {
        description:
          "The account credentials associtated with a 42Intra user_id",
        type: "object",
        properties: {
          account_id: properties.account_id,
          email: properties.email,
          intra_user_id: properties.intra_user_id,
        },
        required: ["account_id", "email", "intra_user_id"],
      },
      404: {
        description: "Account not found",
        type: "object",
        properties: objects.errorBody,
      },
    },
  };

  fastify.get("/:intra_user_id", { schema }, async function handler(request, reply) {
    const { intra_user_id } = request.params;

    const account = db.prepare(`
      SELECT accounts.account_id, accounts.email, fortytwo_auth.*
      FROM accounts
      INNER JOIN fortytwo_auth
        ON accounts.account_id = fortytwo_auth.account_id
      WHERE auth_method = 'fortytwo_auth' AND fortytwo_auth.intra_user_id = ?;
    `).get(intra_user_id);

    if (!account) {
      reply.status(404).send(objects.accountNotFound);
    } else {
      reply.send(account);
    }
  }
  );

  schema = {
    tags: ["42Intra credentials"],
    description: "Create a new account with 42Intra credentials",
    body: {
      type: "object",
      properties: {
        email: properties.email,
        intra_user_id: properties.intra_user_id,
      },
      required: ["email", "intra_user_id"],
    },
    response: {
      201: {
        description:
          "Successfully created new account with 42Intra authentication",
        type: "object",
        properties: {
          account_id: properties.account_id,
          intra_user_id: properties.intra_user_id,
        },
        required: ["account_id", "intra_user_id"],
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
    const { email, intra_user_id } = request.body;

    try {
      const result = db.transaction(() => {
        const account = db.prepare(`
          INSERT INTO accounts (email, auth_method)
          VALUES (?, 'fortytwo_auth')
          RETURNING account_id
        `).get(email);

        return db.prepare(`
          INSERT INTO fortytwo_auth (account_id, intra_user_id)
          VALUES (?, ?)
          RETURNING *
        `).get(account.account_id, intra_user_id);
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

  schema = {
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id,
      },
      required: ["account_id"],
    },
    body: {
      type: "object",
      properties: {
        email: properties.email,
      },
      additionalProperties: false,
    },
  };

  fastify.patch("/:account_id", { schema }, async function handler(request, reply) {
    // Make sure at least one change is requested
    if (!Object.keys(request.body).length) {
      throw new HttpError.BadRequest();
    }

    const { account_id } = request.params;
    const { email } = request.body;

    // Use a transaction so either all or no modification apply
    try {
      const transaction = db.transaction(() => {
        // Update email
        if (email && updateEmail.run(email, account_id).changes === 0) {
          throw new HttpError.NotFound();
        }
      })();
      reply.code(204).send();
      console.log("PATCH", { account_id, email });
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
        reply.code(409).send(objects.emailInUse);
      } else {
        throw err;
      }
    }
  });

  done();
}
