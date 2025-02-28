"use strict";

import { objects, properties } from "yatt-utils";
import db from "../app/database.js";

export default function router(fastify, opts, done) {
  let schema = {
    tags: ["Usernames"],
    summary: "get by username",
    description: "Retrieve a user profile by username",
    params: {
      type: "object",
      properties: {
        username: properties.username,
      },
      required: ["username"],
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

  fastify.get("/usernames/:username", { schema }, async function handler(request, reply) {
    const { username } = request.params;

    const profile = db.prepare("SELECT * FROM profiles WHERE username = ?").get(username);
    if (!profile) {
      reply.code(404).send(objects.accountNotFound);
    } else {
      reply.send(profile);
    }
  });

  done();
}
