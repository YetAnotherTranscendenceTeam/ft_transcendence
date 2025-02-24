"use strict";

import { HttpError, objects } from "yatt-utils";
import getInfos from "../utils/getInfos.js";

export default function router(fastify, opts, done) {
  let schema = {
    tags: ["Users"],
    description: "[PLACEHOLDER]",
    response: {
      500: {
        description: "[PLACEHOLDER]",
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

