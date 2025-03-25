"use strict";

import { HttpError, objects, properties } from "yatt-utils";
import getInfos from "../utils/getInfos.js";
import YATT from "../../../../modules/yatt-utils/srcs/index.js";

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

    let url = new URL("http://db-profiles:3000");
    url.searchParams.append('limit', limit);
    url.searchParams.append('offset', offset);

    if (filter.username) {
      url.searchParams.append('filter[username]', filter.username);
    }
    if (filter["username:match"]) {
      url.searchParams.append('filter[username:match]', filter["username:match"]);
    }
    if (filter["account_id:not"]) {
      url.searchParams.append('filter[account_id:not]', filter["account_id:not"]);
    }
    console.log(url.toString())
    const users = await YATT.fetch(url.toString());
    reply.send(users);
  });

  schema = {
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id,
      },
      required: ["account_id"],
      additionalProperties: false,
    },
  };

  fastify.get("/:account_id", { schema }, async function handler(request, reply) {
    const { account_id } = request.params;

    try {
      const user = await getInfos(account_id);
      reply.send(user);
      console.log("SENT:", user)
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.statusCode === 404) {
          reply.code(404).send(objects.accountNotFound);
        } else {
          err.send(reply);
        }
      } else {
        console.error(err);
        throw err;
      }
    }
  });

  done();
}
