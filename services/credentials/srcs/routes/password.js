"use strict";

import db, { updateEmail, updatePassword } from "../app/database.js";
import { HttpError, objects, properties } from "yatt-utils";
import { createProfile } from "../utils/createProfile.js";

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
      .prepare(`
        SELECT accounts.account_id, accounts.email, password_auth.*
        FROM accounts
        INNER JOIN password_auth
          ON accounts.account_id = password_auth.account_id
        WHERE auth_method = 'password_auth'
          AND email = ?
      `).get(email);

    if (!account) {
      reply.status(404).send(objects.accountNotFound);
    } else {
      reply.send(account);
    }
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
          .prepare(`
            INSERT INTO accounts (email, auth_method)
            VALUES (?, 'password_auth')
            RETURNING account_id
          `).get(email);

        return db
          .prepare(`
            INSERT INTO password_auth (account_id, hash, salt)
            VALUES (?, ?, ?)
            RETURNING *
          `).get(account.account_id, hash, salt);
      })();
      await createProfile(result.account_id);
      return reply.status(201).send(result);
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
        password: {
          type: "object",
          properties: {
            hash: properties.hash,
            salt: properties.salt,
          },
          required: ["hash", "salt"],
          additionalProperties: false,
        }
      },
    },
  };

  fastify.patch("/:account_id", { schema }, async function handler(request, reply) {
    // Make sure at least one change is requested
    if (!Object.keys(request.body).length) {
      throw new HttpError.BadRequest();
    }

    const { account_id } = request.params;
    const { email, password } = request.body;
    
    // Use a transaction so either all or no modification apply
    try {
      const transaction = db.transaction(() => {
        // Update email
        if (email && updateEmail.run(email, account_id).changes === 0) {
          throw new HttpError.NotFound();
        }
        // Update password
        if (password && updatePassword.run(password.hash, password.salt, account_id).changes === 0) {
          throw new HttpError.NotFound();
        }
      })();
      reply.code(204).send();
      console.log("PATCH", { account_id, password, email});
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
