"use strict";

import { HttpError, objects, properties } from "yatt-utils";
import getInfos from "../utils/getInfos.js";

export default function router(fastify, opts, done) {
  const schema = {
    params: {
      type: "object",
      properties: {
        intra_user_id: properties.intra_user_id,
      },
      required: ["intra_user_id"],
      additionalProperties: false,
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
