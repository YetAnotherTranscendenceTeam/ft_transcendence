"use strict";

import { properties } from "yatt-utils";
import YATT from "../../../../modules/yatt-utils/srcs/index.js";

export default function router(fastify, opts, done) {
  const filtersKeys = ["username", "username:match", "account_id", "account_id:not"];

  let schema = {
    querystring: {
      type: "object",
      properties: {
        limit: properties.limit,
        offset: properties.offset,
        filter: {
          type: "object",
          properties: Object.fromEntries(filtersKeys.map(key => [key, { type: "string" }])),
          additionalProperties: false,
        }
      },
      additionalProperties: false,
    },
  };

  fastify.get("/", { schema }, async function handler(request, reply) {
    const { limit, offset, filter = {} } = request.query;

    let url = new URL("http://profiles:3000");
    url.searchParams.append('limit', limit);
    url.searchParams.append('offset', offset);

    filtersKeys.forEach(property => {
      if (filter[property]) {
        url.searchParams.append(`filter[${property}]`, filter[property]);
      }
    })
  
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

    const profile = await YATT.fetch(`http://profiles:3000/${account_id}`);

    reply.send(profile);
  });

  done();
}
