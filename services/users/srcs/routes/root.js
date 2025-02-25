"use strict";

import { HttpError, objects, properties } from "yatt-utils";
import getInfos from "../utils/getInfos.js";

export default function router(fastify, opts, done) {
  let schema = {
    tags: ["Users"],
    description: "Get all public informations about a user",
    response: {
      200: {
        type: "object",
        properties: {
          account_id: properties.account_id,
          username: properties.username,
          avatar: properties.avatar,
          created_at: properties.created_at,
          updated_at: properties.updated_at,
        }
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

    try {
      const user = await getInfos(account_id);
      reply.send(user);
    } catch (err) {
      console.log(err);
      if (err instanceof HttpError) {
        if (err.statusCode === 404) {
          reply.code(404).send(objects.accountNotFound);
        } else {
          err.send(reply);
        }
      } else {
        throw err;
      }
    }
  });

  done();
}

