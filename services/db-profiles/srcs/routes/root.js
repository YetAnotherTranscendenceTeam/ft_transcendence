"use strict";

import YATT, { HttpError, objects, properties } from "yatt-utils";
import db from "../app/database.js";

export default function router(fastify, opts, done) {
  let schema = {
    querystring: {
      type: "object",
      properties: {
        limit: properties.limit,
        offset: properties.offset,
        filter: {
          type: "object",
          properties: {
            "username": { type: "string" },
            "username:match": { type: "string" },
            "account_id:not": { type: "string" }
          },
          additionalProperties: false,
        }
      },
      additionalProperties: false,
    },
  };

  fastify.get("/", { schema }, async function handler(request, reply) {
    const { limit, offset, filter = {} } = request.query;

    let sql = "SELECT * FROM profiles";
    const params = [];    
    const whereConditions = [];

    if (filter.username) {
      whereConditions.push("username = ?");
      params.push(filter.username);
    }
  
    if (filter["username:match"]) {
      whereConditions.push("INSTR(LOWER(username), LOWER(?)) > 0");
      params.push(filter["username:match"]);
    }

    if (filter["account_id:not"]) {
      const ids = filter["account_id:not"].split(',');
      whereConditions.push(`account_id NOT IN (${Array(ids.length).fill('?').join(', ')})`)
      ids.forEach(id => params.push(id));
    }
  
    if (whereConditions.length > 0) {
      sql += " WHERE " + whereConditions.join(" AND ");
    }

    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const profiles = db.prepare(sql).all(...params);
    reply.send(profiles);
  });

  schema = {
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

  fastify.get("/:account_id", { schema }, async function handler(request, reply) {
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

    for (let i = 0; i < 7; ++i) {
      try {
        const username = fastify.usernameBank.getUsername(i >= 5);
        const profile = db.prepare(`
              INSERT INTO profiles (account_id, username, avatar)
              VALUES (?, ?, ?)
              RETURNING *
          `).get(account_id, username, fastify.defaultAvatar);
        reply.code(201).send(profile);
        console.log("POST:", profile);
        fastify.usernameBank.checkAndRefill();
      } catch (err) {
        if (err.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
          return new HttpError.Conflict().send(reply);
        } else if (err.code !== "SQLITE_CONSTRAINT_UNIQUE") {
          throw err;
        }
      }
    }
    new HttpError.ServiceUnavailable().send(reply);
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
      console.log("DELETE:", { account_id });
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
    const { setClause, params } = YATT.patchBodyToSql(request.body);

    try {
      const update = db
        .prepare(`
          UPDATE profiles
          SET ${setClause}
          WHERE account_id = ?
          RETURNING *;
        `)
        .get(...params, account_id);
      console.log("PATCH:", update);
      reply.send(update);
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT_UNIQUE") new HttpError.Conflict().send(reply);
      else throw err;
    }
  });

  done();
}
