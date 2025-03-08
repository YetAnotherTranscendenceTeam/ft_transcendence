"use strict";

import { HttpError, objects, properties } from "yatt-utils";
import db from "../app/database.js";

export default function router(fastify, opts, done) {
  let schema = {
    tags: ["Profiles"],
    summary: "Get a profile",
    description: "Retrieve a user profile by account ID",
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id,
      },
      required: ["account_id"],
    },
    response: {
      200: {
        description: "Successful response with profile data",
        type: "object",
        properties: {
          account_id: properties.account_id,
          username: properties.username,
          avatar: properties.avatar,
          created_at: properties.created_at,
          updated_at: properties.updated_at,
        },
      },
      404: {
        description: "Account not found",
        type: "object",
        properties: objects.errorBody,
      },
    },
  };

  fastify.get(
    "/:account_id",
    { schema },
    async function handler(request, reply) {
      const { account_id } = request.params;

      const profile = db
        .prepare("SELECT * FROM profiles WHERE account_id = ?")
        .get(account_id);
      if (!profile) {
        reply.code(404).send(objects.accountNotFound);
      } else {
        reply.send(profile);
      }
    }
  );

  schema = {
    tags: ["Profiles"],
    summary: "Create profile",
    description: "Create a new profile for a given account ID",
    body: {
      type: "object",
      properties: {
        account_id: properties.account_id
      },
      required: ["account_id"],
      additionalProperties: false
    },
    response: {
      500: {
        description: "[PLACEHOLDER]"
      }
    }
  };

  fastify.post("/", { schema }, async function handler(request, reply) {
    const { account_id } = request.body;

    try {
      const profile = db
        .prepare("INSERT INTO profiles (account_id, avatar) VALUES (?, ?) RETURNING *")
        .get(account_id, fastify.defaultAvatar);
      reply.code(201).send(profile);
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT_PRIMARYKEY") new HttpError.Conflict().send(reply);
      else throw err;
    }
  });

  schema = {
    tags: ["Profiles"],
    summary: "Delete a profile",
    description: "Delete the profile associated with an account ID",
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id
      },
      required: ["account_id"],
      additionalProperties: false,
    },
    response: {
      204: {
        description: "[PLACEHOLDER]"
      }
    }
  };

  fastify.delete("/:account_id", { schema }, async function handler(request, reply) {
      const { account_id } = request.params;

      const result = db
        .prepare(`DELETE FROM profiles WHERE account_id = ?`)
        .run(account_id);
      if (!result.changes) {
        reply.code(404).send(objects.accountNotFound);
      } else {
        reply.code(204).send();
      }
    }
  );

  schema = {
    tags: ["Profiles"],
    summary: "Modify a profile",
    description: "Modify the profile associated with an account ID",
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id
      },
      required: ["account_id"],
      additionalProperties: false
    },
    body: {
      type: "object",
      properties: {
        username: properties.username,
        avatar: properties.avatar
      },
      additionalProperties: false
    },
    response: {
      204: {
        description: "Sucess"
      }
    }
  };

  fastify.patch("/:account_id", { schema }, async function handler(request, reply) {
    const { account_id } = request.params;
    const { setClause, params } = patchBodyToSql(request.body);

    try {
      const update = db
        .prepare(`
          UPDATE profiles
          SET ${setClause}
          WHERE account_id = ?
          RETURNING *;
        `)
        .get(...params, account_id);
      console.log("UPDATE:", update);
      reply.send(update);
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT_UNIQUE") new HttpError.Conflict().send(reply);
      else throw err;
    }
  });

  done();
}

function patchBodyToSql(body) {
  return {
    setClause: Object.keys(body)
      .map((key) => `${key} = ?`)
      .join(", "),
    params: Object.values(body)
  };
}
